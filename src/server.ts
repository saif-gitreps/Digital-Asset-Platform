import express from "express";
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const start = async () => {
   const payload = await getPayloadClient({
      initOptions: {
         express: app,
         onInit: async (cms) => {
            cms.logger.info(`admin URL ${cms.getAdminURL()}`);
         },
      },
   }); // similar to dbs a client

   app.use((req, res) => nextHandler(req, res));

   nextApp.prepare().then(() => {
      payload.logger.info(`Next.js server started`);
      app.listen(PORT, async () => {
         payload.logger.info(`Next.js App Url: ${process.env.NEXT_PUBLIC_APP_URL}`);
      });
   });
};

start();
