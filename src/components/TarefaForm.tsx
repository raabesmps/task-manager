"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { tarefaInputSchema, type Tarefa } from "@/lib/schemas";
import { trpc } from "@/trpc/client";
import { Campo } from "./Campo";
import { RotuloLink } from "./RotuloLink";

type FieldErrors = { titulo?: string; descricao?: string };

type Issue = { path: PropertyKey[]; message: string };

// Keeps the first message per field.
function primeiroErroPorCampo(issues: Issue[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const { path, message } of issues) {
    const campo = path[0];
    if (campo === "titulo" || campo === "descricao") errors[campo] ??= message;
  }
  return errors;
}

export function TarefaForm({ tarefa }: { tarefa?: Tarefa }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(tarefa?.titulo ?? "");
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function onSuccess() {
    router.push("/");
    router.refresh();
  }
  const create = trpc.tarefa.create.useMutation({ onSuccess });
  const update = trpc.tarefa.update.useMutation({ onSuccess });
  const mutation = tarefa ? update : create;
  // Stay disabled after success too, until the navigation completes.
  const salvando = mutation.isPending || mutation.isSuccess;

  // A field's error goes away as soon as the user edits it; submitting
  // validates again, so it comes back if the value is still invalid.
  function limparErro(campo: keyof FieldErrors) {
    setFieldErrors((atuais) => ({ ...atuais, [campo]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The server validates again; this only saves a round trip.
    const parsed = tarefaInputSchema.safeParse({ titulo, descricao });
    if (!parsed.success) {
      setFieldErrors(primeiroErroPorCampo(parsed.error.issues));
      return;
    }
    setFieldErrors({});
    if (tarefa) update.mutate({ id: tarefa.id, ...parsed.data });
    else create.mutate(parsed.data);
  }

  return (
    <form className="formulario" onSubmit={handleSubmit} noValidate>
      {mutation.error && (
        <p role="alert" className="aviso aviso-erro">
          {mutation.error.message}
        </p>
      )}
      <Campo id="titulo" label="Título" erro={fieldErrors.titulo}>
        <input
          id="titulo"
          value={titulo}
          onChange={(event) => {
            setTitulo(event.target.value);
            limparErro("titulo");
          }}
          aria-invalid={Boolean(fieldErrors.titulo)}
          aria-describedby={fieldErrors.titulo ? "titulo-erro" : undefined}
        />
      </Campo>
      <Campo id="descricao" label="Descrição (opcional)" erro={fieldErrors.descricao}>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(event) => {
            setDescricao(event.target.value);
            limparErro("descricao");
          }}
          aria-invalid={Boolean(fieldErrors.descricao)}
          aria-describedby={fieldErrors.descricao ? "descricao-erro" : undefined}
        />
      </Campo>
      <div className="formulario-acoes">
        <button type="submit" className="botao" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </button>
        <Link href="/" className="botao botao-secundario">
          <RotuloLink>Cancelar</RotuloLink>
        </Link>
      </div>
    </form>
  );
}
