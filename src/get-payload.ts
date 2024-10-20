import dotenv from "dotenv";
import path from "path";
import type { InitOptions } from "payload/config";
import payload, { Payload } from "payload";
import nodemailer from "nodemailer";

dotenv.config({
   path: path.resolve(__dirname, "../.env"),
});

const transporter = nodemailer.createTransport({
   host: "smtp.resend.com",
   secure: true,
   port: 465,
   auth: {
      user: "resend",
      pass: process.env.RESEND_API_KEY,
   },
});

interface GlobalPayload {
   payload: {
      client: Payload | null;
      promise: Promise<Payload> | null;
   };
}

let cached = (global as unknown as GlobalPayload).payload;

if (!cached) {
   cached = (global as unknown as GlobalPayload).payload = {
      client: null,
      promise: null,
   };
}

interface Args {
   initOptions?: Partial<InitOptions>;
}

export const getPayloadClient = async ({ initOptions }: Args = {}): Promise<Payload> => {
   if (!process.env.PAYLOAD_SECRET) {
      throw new Error("PAYLOAD_SECRET is missing");
   }

   if (cached.client) {
      return cached.client;
   }

   if (!cached.promise) {
      cached.promise = payload.init({
         email: {
            transport: transporter,
            fromAddress: "onboarding@resend.dev",
            fromName: "DigitalAssets",
         },
         secret: process.env.PAYLOAD_SECRET,
         local: initOptions?.express ? false : true,
         ...(initOptions || {}),
      });
   }

   try {
      cached.client = await cached.promise;
   } catch (e: unknown) {
      cached.promise = null;
      throw e;
   }

   return cached.client;
};
