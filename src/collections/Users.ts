import { CollectionConfig } from "payload/types";

// Admins  are the owners of the platform that verifies all the products being sold
// the users will be both buyers and sellers

export const Users: CollectionConfig = {
   slug: "users",
   auth: true,
   access: {
      read: () => true,
      create: () => true,
   },
   fields: [
      {
         name: "role",
         defaultValue: "user",
         required: true,
         //  admin: {
         //     // condition: ({ req }) => req.user.role === "admin",
         //     condition: () => false,
         //  },
         type: "select",
         options: [
            { label: "Admin", value: "admin" },
            { label: "User", value: "user" },
         ],
      },
   ],
};
