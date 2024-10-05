import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./";

// this generic will contain all the backend
export const trpc = createTRPCReact<AppRouter>({});
