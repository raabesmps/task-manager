import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { TarefaForm } from "@/components/TarefaForm";
import { caller } from "@/server/caller";

export const dynamic = "force-dynamic";

// In Next 15 `params` is a Promise.
export default async function EditarTarefaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tarefa = await caller.tarefa.getById({ id }).catch((error: unknown) => {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") notFound();
    throw error;
  });

  return (
    <main>
      <h1>Editar tarefa</h1>
      <TarefaForm tarefa={tarefa} />
    </main>
  );
}
