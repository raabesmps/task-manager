import type { Tarefa } from "@/lib/schemas";

// The time zone is fixed so the server and the browser render the same text;
// otherwise their local zones could differ and break hydration.
function formatarData(timestamp: number) {
  return new Date(timestamp).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
}

export function TarefaItem({ tarefa }: { tarefa: Tarefa }) {
  return (
    <li className="tarefa">
      <h2>{tarefa.titulo}</h2>
      {tarefa.descricao && <p>{tarefa.descricao}</p>}
      <time dateTime={new Date(tarefa.dataCriacao).toISOString()}>
        {formatarData(tarefa.dataCriacao)}
      </time>
    </li>
  );
}
