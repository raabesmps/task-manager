import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers";

export const trpc = createTRPCReact<AppRouter>();

export type TarefaPage = inferRouterOutputs<AppRouter>["tarefa"]["list"];
