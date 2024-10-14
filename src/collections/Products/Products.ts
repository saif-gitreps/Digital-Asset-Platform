import { PRODUCT_CATEGORIES } from "../../config";
import { CollectionConfig } from "payload/types";
import { Product } from "../../payload-types";
import { stripe } from "../../lib/stripe";

export const Products: CollectionConfig = {
   slug: "products",
   admin: {
      useAsTitle: "name",
   },
   access: {},
   hooks: {
      beforeChange: [
         async ({ req, data }) => {
            const user = req.user;

            return { ...data, user: user.id };
         },
         async (args) => {
            if (args.operation === "create") {
               const data = args.data as Product;

               const createdProduct = await stripe.products.create({
                  name: data.name,
                  default_price_data: {
                     currency: "USD",
                     unit_amount: Math.round(data.price * 100),
                  },
               });

               const updated: Product = {
                  ...data,
                  stripeId: createdProduct.id,
                  priceId: createdProduct.default_price as string,
               };

               return updated;
            } else if (args.operation === "update") {
               const data = args.data as Product;

               const updatedProduct = await stripe.products.update(data.stripeId!, {
                  name: data.name,
                  default_price: data.priceId!,
               });

               const updated: Product = {
                  ...data,
                  stripeId: updatedProduct.id,
                  priceId: updatedProduct.default_price as string,
               };

               return updated;
            }
         },
      ],
   },
   fields: [
      {
         name: "user",
         type: "relationship",
         relationTo: "users",
         required: true,
         hasMany: false,
         admin: {
            condition: () => false,
         },
      },
      {
         name: "name",
         label: "Name",
         type: "text",
         required: true,
      },
      {
         name: "description",
         type: "textarea",
         label: "Product details",
      },
      {
         name: "price",
         label: "Price in USD",
         min: 0,
         max: 100000,
         type: "number",
         required: true,
      },
      {
         name: "category",
         label: "Category",
         type: "select",
         options: PRODUCT_CATEGORIES.map(({ label, value }) => ({ label, value })),
         required: true,
      },
      {
         label: "Product file(s)",
         name: "product_files",
         type: "relationship",
         relationTo: "product_files",
         required: true,
         hasMany: false, // TODO: Change to true
      },
      {
         name: "approvedForSale",
         label: "Product Status",
         type: "select",
         defaultValue: "pending",
         access: {
            create: ({ req }) => req.user.role === "admin",
            read: ({ req }) => req.user.role === "admin",
            update: ({ req }) => req.user.role === "admin",
         },
         options: [
            {
               label: "Pending verification",
               value: "pending",
            },
            {
               label: "Approved",
               value: "approved",
            },
            {
               label: "Denied",
               value: "denied",
            },
         ],
      },
      {
         name: "priceId",
         access: {
            create: () => false,
            read: () => false,
            update: () => false,
         },
         type: "text",
         admin: {
            hidden: true,
         },
      },
      {
         name: "stripeId",
         access: {
            create: () => false,
            read: () => false,
            update: () => false,
         },
         type: "text",
         admin: {
            hidden: true,
         },
      },
      {
         name: "images",
         type: "array",
         label: "Product images",
         minRows: 1,
         maxRows: 5,
         required: true,
         labels: {
            singular: "Image",
            plural: "Images",
         },
         fields: [
            {
               name: "image",
               type: "upload",
               relationTo: "media",
               required: true,
            },
         ],
      },
   ],
};
