import type { TarefaPage } from "@/trpc/client";
import { TarefaItem } from "./TarefaItem";

export function TarefaList({ initialPage }: { initialPage: TarefaPage }) {
  if (initialPage.items.length === 0) {
    return <p>Nenhuma tarefa ainda</p>;
  }

  return (
    <ul className="tarefas">
      {initialPage.items.map((tarefa) => (
        <TarefaItem key={tarefa.id} tarefa={tarefa} />
      ))}
    </ul>
  );
}
