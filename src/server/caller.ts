import { appRouter } from "./routers";
import { createCallerFactory } from "./trpc";

// Lets server components call the router directly, with no HTTP round trip.
export const caller = createCallerFactory(appRouter)({});
