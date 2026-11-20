"use client";

import Link from "next/link";
import type { Tarefa } from "@/lib/schemas";
import { trpc } from "@/trpc/client";

export type Feedback = { tipo: "sucesso" | "erro"; mensagem: string };

// The time zone is fixed so the server and the browser render the same text;
// otherwise their local zones could differ and break hydration.
function formatarData(timestamp: number) {
  return new Date(timestamp).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
}

type TarefaItemProps = {
  tarefa: Tarefa;
  onFeedback: (feedback: Feedback | null) => void;
};

export function TarefaItem({ tarefa, onFeedback }: TarefaItemProps) {
  const utils = trpc.useUtils();
  const remove = trpc.tarefa.delete.useMutation({
    onSuccess: () => onFeedback({ tipo: "sucesso", mensagem: "Tarefa excluída com sucesso" }),
    onError: (error) => onFeedback({ tipo: "erro", mensagem: error.message }),
    // Refetch on failure too: a NOT_FOUND means the task is already gone.
    onSettled: () => utils.tarefa.list.invalidate(),
  });

  function handleDelete() {
    onFeedback(null);
    remove.mutate({ id: tarefa.id });
  }

  return (
    <li className="tarefa">
      <div className="tarefa-corpo">
        <h2>{tarefa.titulo}</h2>
        {tarefa.descricao && <p>{tarefa.descricao}</p>}
        <time dateTime={new Date(tarefa.dataCriacao).toISOString()}>
          {formatarData(tarefa.dataCriacao)}
        </time>
      </div>
      <div className="acoes">
        <Link href={`/tarefas/${tarefa.id}/editar`} className="acao">
          Editar
        </Link>
        <button
          type="button"
          className="acao acao-excluir"
          onClick={handleDelete}
          disabled={remove.isPending}
        >
          {remove.isPending ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </li>
  );
}
