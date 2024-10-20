import express from "express";
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";
import { inferAsyncReturnType } from "@trpc/server";
import bodyParser from "body-parser";
import { IncomingMessage } from "http";
import { stripeWebhookHandler } from "./webhook";
import nextBuild from "next/dist/build";
import path from "path";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({
   req,
   res,
});

export type ExpressContext = inferAsyncReturnType<typeof createContext>;

export type WebhookRequest = IncomingMessage & { rawBody: Buffer };

const start = async () => {
   const webhookMiddleware = bodyParser.json({
      verify: (req: WebhookRequest, _, buffer) => {
         req.rawBody = buffer;
      },
   });

   // @ts-expect-error, its alright.
   app.post("/api/webhooks/stripe", webhookMiddleware, stripeWebhookHandler);

   const payload = await getPayloadClient({
      initOptions: {
         express: app,
         onInit: async (cms) => {
            cms.logger.info(`admin URL ${cms.getAdminURL()}`);
         },
      },
   }); // similar to dbs a client

   if (process.env.NEXT_BUILD) {
      app.listen(PORT, async () => {
         payload.logger.info("Next is building for prod.");

         // @ts-expect-error , can be avoided
         await nextBuild(path.join(__dirname, "../"));

         process.exit();
      });

      return;
   }

   // passing any endpoints to our next trpc
   // the req and res are passed to the createContext function which is passed to the next api endpoint
   // in next.js we listen to the things getting passed using router handler.

   app.use(
      "/api/trpc",
      trpcExpress.createExpressMiddleware({
         router: appRouter,
         createContext,
      })
   );

   app.use((req, res) => nextHandler(req, res));

   nextApp.prepare().then(() => {
      payload.logger.info(`Next.js server started`);

      app.listen(PORT, async () => {
         payload.logger.info(`Next.js App Url: ${process.env.NEXT_PUBLIC_APP_URL}`);
      });
   });
};

start();
