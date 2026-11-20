import { initTRPC } from "@trpc/server";

// No auth or request context: the app has a single anonymous user.
const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
