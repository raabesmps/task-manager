import type { Tarefa, TarefaInput } from "@/lib/schemas";

const MINUTE_MS = 60_000;

const SEED_TITULOS = [
  "Estudar tRPC",
  "Revisar README",
  "Organizar a mesa de trabalho",
  "Planejar a semana",
  "Regar as plantas",
  "Escrever testes do router",
  "Atualizar dependências",
  "Ler um capítulo do livro",
  "Marcar consulta de rotina",
  "Fazer backup dos documentos",
  "Revisar o código da lista",
  "Preparar a pauta da reunião",
  "Responder e-mails pendentes",
  "Comprar café",
  "Limpar a caixa de entrada",
  "Estudar Server Components",
  "Ajustar o layout do formulário",
  "Praticar TypeScript",
  "Fazer uma caminhada",
  "Cozinhar o jantar",
  "Atualizar o calendário",
  "Revisar mensagens de erro",
  "Treinar o infinite scroll",
  "Documentar as decisões",
  "Comemorar a entrega",
];

function criarSeed(): Tarefa[] {
  const agora = Date.now();
  // Newest first, one minute apart so the ordering is deterministic.
  return SEED_TITULOS.map((titulo, index) => ({
    id: crypto.randomUUID(),
    titulo,
    descricao: index % 3 === 0 ? `Descrição fictícia da tarefa "${titulo}".` : undefined,
    dataCriacao: agora - index * MINUTE_MS,
  }));
}

// Kept on globalThis because Next reloads modules on HMR in dev, which would
// reset a plain module-level array and wipe the data on every edit.
const globalForStore = globalThis as typeof globalThis & { tarefas?: Tarefa[] };
const tarefas = (globalForStore.tarefas ??= criarSeed());

// An empty description is stored as "no description".
function normalizar({ titulo, descricao }: TarefaInput) {
  return { titulo, descricao: descricao || undefined };
}

export function listar(cursor: number, limit: number): Tarefa[] {
  return tarefas.slice(cursor, cursor + limit);
}

export function total(): number {
  return tarefas.length;
}

export function buscarPorId(id: string): Tarefa | undefined {
  return tarefas.find((tarefa) => tarefa.id === id);
}

export function criar(input: TarefaInput): Tarefa {
  const tarefa: Tarefa = {
    id: crypto.randomUUID(),
    ...normalizar(input),
    dataCriacao: Date.now(),
  };
  tarefas.unshift(tarefa); // the array is always newest first
  return tarefa;
}

export function atualizar(id: string, input: TarefaInput): Tarefa | undefined {
  const index = tarefas.findIndex((tarefa) => tarefa.id === id);
  if (index === -1) return undefined;
  const atualizada: Tarefa = { ...tarefas[index], ...normalizar(input) };
  tarefas[index] = atualizada;
  return atualizada;
}

export function remover(id: string): boolean {
  const index = tarefas.findIndex((tarefa) => tarefa.id === id);
  if (index === -1) return false;
  tarefas.splice(index, 1);
  return true;
}
