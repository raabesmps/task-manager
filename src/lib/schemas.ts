import { z } from "zod";

export const MAX_TITULO = 100;
export const MAX_DESCRICAO = 500;

// Single source of truth: the server validates with it and the form reuses it.
export const tarefaInputSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "O título é obrigatório")
    .max(MAX_TITULO, `Máximo de ${MAX_TITULO} caracteres`),
  descricao: z
    .string()
    .trim()
    .max(MAX_DESCRICAO, `Máximo de ${MAX_DESCRICAO} caracteres`)
    .optional(),
});

export type TarefaInput = z.infer<typeof tarefaInputSchema>;

export type Tarefa = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: number; // epoch ms, a plain number avoids needing a superjson transformer
};
