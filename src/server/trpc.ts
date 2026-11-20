import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";

// No auth or request context: the app has a single anonymous user.
const t = initTRPC.create({
  // By default a zod failure reaches the client as a raw JSON dump of its
  // issues. Expose the first issue's message instead, so the UI can show it.
  errorFormatter({ shape, error }) {
    if (error.cause instanceof ZodError) {
      return { ...shape, message: error.cause.issues[0]?.message ?? shape.message };
    }
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
