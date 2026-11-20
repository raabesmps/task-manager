import { router } from "../trpc";
import { tarefaRouter } from "./tarefa";

export const appRouter = router({
  tarefa: tarefaRouter,
});

// The client only imports this type, never the server code.
export type AppRouter = typeof appRouter;
