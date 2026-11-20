"use client";

import { useEffect, useRef } from "react";

type CarregarMaisProps = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  errorMessage?: string;
  onLoadMore: () => void;
};

export function CarregarMais({
  hasNextPage,
  isFetchingNextPage,
  errorMessage,
  onLoadMore,
}: CarregarMaisProps) {
  const sentinela = useRef<HTMLDivElement>(null);
  // While an error is shown the user retries by hand; loading on scroll would
  // loop forever, since the sentinel stays visible.
  const podeCarregar = hasNextPage && !isFetchingNextPage && !errorMessage;

  useEffect(() => {
    const element = sentinela.current;
    if (!element || !podeCarregar) return;
    // A new observer reports the current visibility right away, so a page
    // that does not fill the screen keeps loading until it does.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onLoadMore();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [podeCarregar, onLoadMore]);

  if (errorMessage) {
    return (
      <div className="rodape">
        <p role="alert" className="aviso aviso-erro">
          Não foi possível carregar mais tarefas. {errorMessage}
        </p>
        <button type="button" className="botao botao-secundario" onClick={onLoadMore}>
          Tentar de novo
        </button>
      </div>
    );
  }
  if (isFetchingNextPage) {
    return (
      <p role="status" className="rodape">
        Carregando mais...
      </p>
    );
  }
  if (!hasNextPage) return <p className="rodape">Fim da lista</p>;
  return <div ref={sentinela} className="sentinela" aria-hidden="true" />;
}
