"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
// Admins  are the owners of the platform that verifies all the products being sold
// Users will be both buyers and sellers
exports.Users = {
    slug: "users",
    auth: {
        verify: {
            generateEmailHTML: function (_a) {
                var token = _a.token;
                return "<a href=\"".concat(process.env.NEXT_PUBLIC_SERVER_URL, "/verify-email?token=").concat(token, "\"> verify email </a>");
            },
        },
    },
    access: {
        read: function () { return true; },
        create: function () { return true; },
    },
    fields: [
        {
            name: "role",
            defaultValue: "user",
            required: true,
            admin: {
            //condition: ({ req }) => req.user.role === "admin",
            //condition: () => false,
            },
            type: "select",
            options: [
                { label: "Admin", value: "admin" },
                { label: "User", value: "user" },
            ],
        },
    ],
};
