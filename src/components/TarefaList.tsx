"use client";

import { useState } from "react";
import { trpc, type TarefaPage } from "@/trpc/client";
import { TarefaItem, type Feedback } from "./TarefaItem";

export function TarefaList({ initialPage }: { initialPage: TarefaPage }) {
  // The page rendered on the server seeds the cache, so there is no loading
  // flash and no refetch right after hydration. gcTime 0 drops the cache when
  // the list unmounts, so coming back from the form uses the fresh server
  // render instead of a stale cached list.
  const { data } = trpc.tarefa.list.useQuery(
    {},
    { initialData: initialPage, gcTime: 0 },
  );

  // Kept here, not in the item: the item unmounts as soon as it is deleted,
  // and its success message would disappear with it.
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  return (
    <>
      {feedback && (
        <p
          role={feedback.tipo === "sucesso" ? "status" : "alert"}
          className={`aviso aviso-${feedback.tipo}`}
        >
          {feedback.mensagem}
        </p>
      )}
      {data.items.length === 0 ? (
        <p className="vazio">Nenhuma tarefa ainda</p>
      ) : (
        <ul className="tarefas">
          {data.items.map((tarefa) => (
            <TarefaItem key={tarefa.id} tarefa={tarefa} onFeedback={setFeedback} />
          ))}
        </ul>
      )}
    </>
  );
}
