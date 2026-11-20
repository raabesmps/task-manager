import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/trpc/[trpc]/route";
import { caller } from "@/server/caller";

const tarefa = caller.tarefa;

// The store is a singleton shared by every test in this file, so each test
// creates the data it needs and never assumes how many tasks exist.

describe("tarefa.create", () => {
  it.each(["", "   "])("rejects a blank title (%j)", async (titulo) => {
    await expect(tarefa.create({ titulo })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("trims the title and lists the newest task first", async () => {
    const primeira = await tarefa.create({ titulo: "  Primeira  " });
    const segunda = await tarefa.create({ titulo: "Segunda" });

    expect(primeira.titulo).toBe("Primeira");
    const { items } = await tarefa.list({ limit: 2 });
    expect(items.map((item) => item.id)).toEqual([segunda.id, primeira.id]);
  });
});

describe("tarefa.update", () => {
  it("fails with NOT_FOUND for an unknown id", async () => {
    await expect(tarefa.update({ id: "nao-existe", titulo: "Novo" })).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Tarefa não encontrada",
    });
  });

  it("applies the same validation as create and leaves the task untouched", async () => {
    const original = await tarefa.create({ titulo: "Original" });

    await expect(tarefa.update({ id: original.id, titulo: "  " })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    expect((await tarefa.getById({ id: original.id })).titulo).toBe("Original");
  });
});

describe("tarefa.delete and tarefa.getById", () => {
  it("removes the task, then reports NOT_FOUND for it", async () => {
    const criada = await tarefa.create({ titulo: "Para excluir" });

    expect(await tarefa.delete({ id: criada.id })).toEqual({ id: criada.id });
    await expect(tarefa.getById({ id: criada.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(tarefa.delete({ id: criada.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Tarefa não encontrada",
    });
  });
});

describe("tarefa.list", () => {
  it("walks every page with the right nextCursor and no repeated task", async () => {
    const vistos: string[] = [];
    let cursor: number | undefined;

    do {
      const pagina = await tarefa.list({ cursor, limit: 10 });
      expect(pagina.items.length).toBeLessThanOrEqual(10);
      vistos.push(...pagina.items.map((item) => item.id));
      // The cursor is an offset: it points right after what was already read.
      if (pagina.nextCursor !== undefined) expect(pagina.nextCursor).toBe(vistos.length);
      cursor = pagina.nextCursor;
    } while (cursor !== undefined);

    expect(new Set(vistos).size).toBe(vistos.length);
    // Same order and content as reading everything in one go.
    const tudo = await tarefa.list({ limit: 50 });
    expect(vistos.slice(0, 50)).toEqual(tudo.items.map((item) => item.id));
  });

  it.each([0, 51])("rejects a limit outside 1..50 (%i)", async (limit) => {
    await expect(tarefa.list({ limit })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("HTTP handler", () => {
  it("answers a validation failure with its message, not a raw zod dump", async () => {
    const response = await POST(
      new Request("http://localhost/api/trpc/tarefa.create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ titulo: "  " }),
      }),
    );

    const body: { error: { message: string } } = await response.json();
    expect(response.status).toBe(400);
    expect(body.error.message).toBe("O título é obrigatório");
  });
});
