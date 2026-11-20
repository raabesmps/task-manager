"use client";

import { useState } from "react";
import { trpc, type TarefaPage } from "@/trpc/client";
import { CarregarMais } from "./CarregarMais";
import { TarefaItem, type Feedback } from "./TarefaItem";

export function TarefaList({ initialPage }: { initialPage: TarefaPage }) {
  // The page rendered on the server is the first page of the query, so there
  // is no loading flash and no refetch right after hydration. gcTime 0 drops
  // the cache when the list unmounts, so coming back from the form starts from
  // the fresh server render instead of a stale cached list.
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError, error } =
    trpc.tarefa.list.useInfiniteQuery(
      {},
      {
        getNextPageParam: (page) => page.nextCursor,
        initialData: { pages: [initialPage], pageParams: [undefined] },
        gcTime: 0,
        // The footer already offers "Tentar de novo"; silent automatic retries
        // would delay the error by several seconds.
        retry: false,
      },
    );

  // Kept here, not in the item: the item unmounts as soon as it is deleted,
  // and its success message would disappear with it.
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const tarefas = data.pages.flatMap((page) => page.items);

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
      {tarefas.length === 0 ? (
        <p className="vazio">Nenhuma tarefa ainda</p>
      ) : (
        <>
          <ul className="tarefas">
            {tarefas.map((tarefa) => (
              <TarefaItem key={tarefa.id} tarefa={tarefa} onFeedback={setFeedback} />
            ))}
          </ul>
          <CarregarMais
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            errorMessage={isFetchNextPageError ? error?.message : undefined}
            onLoadMore={fetchNextPage}
          />
        </>
      )}
    </>
  );
}
