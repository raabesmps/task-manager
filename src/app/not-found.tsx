import Link from "next/link";

// Also shown by notFound() when the task to edit does not exist.
export default function NotFound() {
  return (
    <main>
      <h1>Página não encontrada</h1>
      <p>O endereço não existe ou a tarefa foi removida.</p>
      <p>
        <Link href="/" className="botao">
          Voltar para a lista
        </Link>
      </p>
    </main>
  );
}
