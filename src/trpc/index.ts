import { publicProcedure, router } from "./trpc";

export const appRouter = router({
   anyApiRoute: publicProcedure.query(() => {
      return 23;
   }),
});

export type AppRouter = typeof appRouter;
