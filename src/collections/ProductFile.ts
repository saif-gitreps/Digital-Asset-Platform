import { User } from "../payload-types";
// import { BeforeChangeHook } from "payload/dist/globals/config/types";
import { Access, CollectionConfig } from "payload/types";

// const addUser: BeforeChangeHook = ({ req, data }) => {
//    const user = req.user as User | null;

//    return { ...data, user: user?.id };
// };

const yourOwnAndPurchased: Access = async ({ req }) => {
   const user = req.user as User | null;

   if (user?.role === "admin") return true;

   if (!user) return false;

   const { docs: products } = await req.payload.find({
      collection: "products",
      depth: 0,
      where: {
         user: {
            equals: user.id,
         },
      },
   });

   const ownProductFileIds = products.map((prod) => prod.product_files).flat();

   const { docs: orders } = await req.payload.find({
      collection: "orders",
      depth: 2,
      where: {
         user: {
            equals: user.id,
         },
      },
   });

   const purchasedProductFileIds = orders
      .map((order) => {
         return order.products.map((prod) => {
            if (typeof prod === "string") {
               return req.payload.logger.error(
                  "search depth not enough to find purchased file IDs"
               );
            }

            return typeof prod.product_files === "string"
               ? prod.product_files
               : prod.product_files.id;
         });
      })
      .filter(Boolean)
      .flat();

   return {
      id: {
         in: [...ownProductFileIds, ...purchasedProductFileIds],
      },
   };
};

export const ProductFiles: CollectionConfig = {
   slug: "product_files",
   admin: {
      hidden: ({ user }) => user.role !== "admin",
   },
   hooks: {
      beforeChange: [
         // addUser
         ({ req, data }) => {
            const user = req.user as User | null;

            return { ...data, user: user?.id };
         },
      ],
   },
   access: {
      read: yourOwnAndPurchased,
      // for create, every authenticated user can create a product file.
      update: ({ req }) => req.user?.role === "admin",
      delete: ({ req }) => req.user?.role === "admin",
   },
   upload: {
      staticURL: "/product_files",
      staticDir: "product_files",
      mimeTypes: ["image/*", "font/*", "application/postscript"],
   },
   fields: [
      {
         name: "user",
         type: "relationship",
         relationTo: "users",
         admin: {
            condition: () => false,
         },
         hasMany: false, // product file should belong to one user
         required: true,
      },
   ],
};
