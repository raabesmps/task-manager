import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { tarefaInputSchema } from "@/lib/schemas";
import * as store from "../store";
import { publicProcedure, router } from "../trpc";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const idSchema = z.object({ id: z.string().min(1) });

function tarefaNaoEncontrada() {
  return new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada" });
}

export const tarefaRouter = router({
  // The cursor is the offset of the next item. That is enough for an in-memory
  // store; a real database should use a cursor based on id or timestamp, since
  // offsets skip or repeat items when rows are deleted during scrolling.
  list: publicProcedure
    .input(
      z.object({
        cursor: z.number().int().min(0).optional(),
        limit: z.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
      }),
    )
    .query(({ input }) => {
      const cursor = input.cursor ?? 0;
      const items = store.listar(cursor, input.limit);
      const next = cursor + items.length;
      return { items, nextCursor: next < store.total() ? next : undefined };
    }),

  getById: publicProcedure.input(idSchema).query(({ input }) => {
    const tarefa = store.buscarPorId(input.id);
    if (!tarefa) throw tarefaNaoEncontrada();
    return tarefa;
  }),

  create: publicProcedure
    .input(tarefaInputSchema)
    .mutation(({ input }) => store.criar(input)),

  update: publicProcedure
    .input(tarefaInputSchema.extend(idSchema.shape))
    .mutation(({ input: { id, ...dados } }) => {
      const tarefa = store.atualizar(id, dados);
      if (!tarefa) throw tarefaNaoEncontrada();
      return tarefa;
    }),

  delete: publicProcedure.input(idSchema).mutation(({ input }) => {
    if (!store.remover(input.id)) throw tarefaNaoEncontrada();
    return { id: input.id };
  }),
});
