import express from "express";
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";
import { inferAsyncReturnType } from "@trpc/server";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({
   req,
   res,
});

export type ExpressContext = inferAsyncReturnType<typeof createContext>;

const start = async () => {
   const payload = await getPayloadClient({
      initOptions: {
         express: app,
         onInit: async (cms) => {
            cms.logger.info(`admin URL ${cms.getAdminURL()}`);
         },
      },
   }); // similar to dbs a client

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
