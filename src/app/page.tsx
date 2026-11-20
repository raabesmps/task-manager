import { TarefaList } from "@/components/TarefaList";
import { caller } from "@/server/caller";

// The data changes on every mutation, so render on each request instead of
// at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Called straight from the server: no HTTP round trip for the first page.
  const initialPage = await caller.tarefa.list({});

  return (
    <main>
      <h1>Tarefas</h1>
      <TarefaList initialPage={initialPage} />
    </main>
  );
}
