import { z } from "zod";
import { authRouter } from "./auth-router";
import { publicProcedure, router } from "./trpc";
import { QueryValidator } from "../lib/validators/query-validator";
import { getPayloadClient } from "../get-payload";
import { paymentRouter } from "./payment-router";

export const appRouter = router({
   auth: authRouter,

   payment: paymentRouter,

   getInfiniteProducts: publicProcedure
      .input(
         z.object({
            limit: z.number().min(1).max(100),
            cursor: z.number().nullish(), // cursor is the last element that was rendered.
            query: QueryValidator,
         })
      )
      .query(async ({ input }) => {
         const { query, cursor } = input;
         const { sort, limit, ...queryOptions } = query;

         const payload = await getPayloadClient();

         const parsedQueryOptions: Record<string, { equals: string }> = {};

         Object.entries(queryOptions).forEach(([key, value]) => {
            parsedQueryOptions[key] = {
               equals: value,
            };
         });

         const page = cursor || 1;

         const {
            docs: items,
            hasNextPage,
            nextPage,
         } = await payload.find({
            collection: "products",
            where: {
               approvedForSale: {
                  equals: "approved",
               },
               ...parsedQueryOptions,
            },
            sort,
            depth: 1,
            limit,
            page,
         });

         return {
            items,
            nextPage: hasNextPage ? nextPage : null,
         };
      }),
});

export type AppRouter = typeof appRouter;
