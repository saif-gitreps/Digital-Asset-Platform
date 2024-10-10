import { User } from "@/payload-types";
import { Access, CollectionConfig } from "payload/types";

const isAdminOrHasAccessToImages =
   (): Access =>
   async ({ req }) => {
      const user = req.user as User | undefined;

      if (!user) return false;

      if (user.role === "admin") return true;

      // query constaint
      return {
         // if the user owns this image then true.
         user: {
            equals: req.user.id,
         },
      };
   };

export const Media: CollectionConfig = {
   slug: "media",
   admin: {
      hidden: ({ user }) => user.role !== "admin",
   },
   access: {
      read: async ({ req }) => {
         const referer = req.headers.referer;

         // either people who are broswing (unauthenticated) can read or if you are
         // authenticated and not on the seller dashboard can see the media.

         if (!req.user || !referer?.includes("sell")) {
            return true;
         }

         return await isAdminOrHasAccessToImages()({ req });
      },
      delete: isAdminOrHasAccessToImages(),
      update: isAdminOrHasAccessToImages(),
   },
   hooks: {
      beforeChange: [
         ({ req, data }) => {
            return { ...data, user: req.user.id };
         },
      ],
   },
   upload: {
      staticURL: "/media",
      staticDir: "media",
      imageSizes: [
         {
            name: "thumbnail",
            width: 400,
            height: 300,
            position: "centre",
         },
         {
            name: "card",
            width: 768,
            height: 1024,
            position: "centre",
         },
         {
            name: "tablet",
            width: 1024,
            height: undefined,
            position: "centre",
         },
      ],
      mimeTypes: ["image/*"],
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
   ],
};
