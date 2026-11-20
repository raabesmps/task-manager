# Task Manager

A simple task manager built with **Next.js 15** and **tRPC**. Tasks live in memory (no database), the list is rendered on the server and loads more as you scroll, and every input is validated on the server. All data is fictional.

> A Portuguese version is available at the end of this file, in a collapsible section.

## Features

- Create, list, edit and delete tasks (`titulo` required, `descricao` optional).
- The home page (`/`) is **server-rendered**: the first page of tasks is already in the HTML.
- **Infinite scroll**: more tasks load as you reach the end of the list, with loading, end-of-list and error (with retry) states.
- Delete straight from the list, with a "deleting" state and a success or error message.
- Create and edit form with client-side validation and backend errors (for example, editing a task that no longer exists).
- Editing an unknown id shows a 404 page.

## Stack

| Area | Choice |
|------|--------|
| Framework | Next.js 15 (App Router), React 19, TypeScript in strict mode |
| API | tRPC v11 with TanStack Query v5 |
| Validation | zod, shared by the server and the form |
| Styling | One plain `globals.css`, no UI library |
| Tests | vitest |

## Getting started

Requires **Node.js 22.12 or newer** (the app runs on Node 20+, the test runner needs 22.12+).

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

Other scripts: `npm test` (vitest) and `npm run lint`.

> **The data is stored in memory.** It resets whenever the server restarts, and each start begins with 25 fictional tasks so the infinite scroll can be tried right away.

## Project structure

```
src/
├── app/
│   ├── layout.tsx                 # html shell, header, <Providers>
│   ├── globals.css                # the only stylesheet
│   ├── page.tsx                   # "/": server-rendered list
│   ├── not-found.tsx              # 404 page (pt-BR)
│   ├── tarefas/
│   │   ├── nova/page.tsx          # create form
│   │   └── [id]/editar/page.tsx   # edit form (404 if the task does not exist)
│   └── api/trpc/[trpc]/route.ts   # tRPC over HTTP (GET and POST)
├── components/
│   ├── Providers.tsx              # tRPC and React Query providers
│   ├── TarefaList.tsx             # list, delete feedback, infinite query
│   ├── TarefaItem.tsx             # one task: Editar link, Excluir button
│   ├── CarregarMais.tsx           # infinite-scroll sentinel and footer states
│   ├── TarefaForm.tsx             # create/edit form
│   ├── Campo.tsx                  # label + control + inline error
│   └── RotuloLink.tsx             # pending spinner for navigation links
├── lib/schemas.ts                 # zod schema and Tarefa type (shared)
├── server/
│   ├── store.ts                   # in-memory store and seed
│   ├── trpc.ts                    # initTRPC and error formatter
│   ├── caller.ts                  # server-side caller (no HTTP)
│   └── routers/
│       ├── tarefa.ts              # list, getById, create, update, delete
│       ├── tarefa.test.ts         # router tests
│       └── index.ts               # appRouter and the AppRouter type
└── trpc/client.ts                 # createTRPCReact<AppRouter>()
```

## API

| Procedure | Type | Input | Errors |
|-----------|------|-------|--------|
| `tarefa.list` | query | `{ cursor?, limit? }` (limit 1 to 50, default 10) | `BAD_REQUEST` |
| `tarefa.getById` | query | `{ id }` | `NOT_FOUND` |
| `tarefa.create` | mutation | `{ titulo, descricao? }` | `BAD_REQUEST` |
| `tarefa.update` | mutation | `{ id, titulo, descricao? }` | `NOT_FOUND`, `BAD_REQUEST` |
| `tarefa.delete` | mutation | `{ id }` | `NOT_FOUND` |

A task is `{ id, titulo, descricao?, dataCriacao }`, where `dataCriacao` is a timestamp in milliseconds. The list is ordered newest first and returns `{ items, nextCursor? }`.

## Main decisions

- **The store lives on `globalThis`.** In development Next reloads modules on every edit, which would reset a plain module-level array and wipe the data.
- **Server-side rendering without an HTTP round trip.** `page.tsx` calls the router directly through a tRPC caller. The page is always rendered on request (`force-dynamic`), since the data changes.
- **The server render is the first page of the infinite query.** It is passed as `initialData`, so there is no loading flash and no refetch after hydration. The list drops its cache when it unmounts (`gcTime: 0`), so coming back from the form always starts from fresh data.
- **One validation schema.** The form and the server use the same zod schema. The server validates again because the client is never the only barrier, and an error formatter turns a zod failure into its first message instead of a raw JSON dump.
- **Offset cursor.** Enough for an in-memory list. With a real database a cursor based on id or timestamp would be better, because offsets can skip or repeat an item when rows are removed during scrolling.
- **Feedback without a library.** A small piece of state renders a `role="status"` or `role="alert"` message. The delete message lives in the list, not in the item, because the item unmounts once deleted.
- **Fixed time zone for dates** (`America/Sao_Paulo`), so the server and the browser render the same text and hydration does not mismatch.
- **No silent retries on "load more".** The footer already offers a retry button, and React Query's default retries would delay the error by several seconds.
- **Navigation feedback.** The links that open another page show a small spinner after 150 ms, so a slow navigation does not look like a missed click.

## Tests

`npm test` runs ten tests, nine through the server caller and one through the HTTP handler. They cover the behaviours the app depends on:

- blank titles are rejected, on create and on update;
- an unknown id gives `NOT_FOUND` on update, delete and `getById`;
- pagination returns the right `nextCursor`, reaches the end and never repeats a task;
- the newest task is listed first and `limit` is bounded;
- a validation failure reaches the client as a readable message.

## Left out on purpose

Database, authentication, Tailwind or UI libraries, global state managers, form libraries, toast libraries, task status, priority or tags, search and filters, drag and drop, Docker, CI, i18n, dark mode and animations. Component and end-to-end tests are also out of scope.

## Known limitations

- **Data is not persistent.** It resets with the server.
- **Offset pagination** can skip or repeat an item if tasks are created or deleted elsewhere while scrolling (see above).
- **`npm audit` reports vulnerabilities in `postcss`**, which is bundled inside Next 15. The fix requires Next 16, outside what this project targets. It is a build-time dependency and is not used to serve requests.

---

<details>
<summary><strong>Português (pt-BR)</strong></summary>

# Gerenciador de Tarefas

Um gerenciador de tarefas simples feito com **Next.js 15** e **tRPC**. As tarefas ficam em memória (sem banco de dados), a lista é renderizada no servidor e carrega mais itens conforme você rola, e toda entrada é validada no servidor. Todos os dados são fictícios.

## Funcionalidades

- Criar, listar, editar e excluir tarefas (`titulo` obrigatório, `descricao` opcional).
- A página inicial (`/`) é **renderizada no servidor**: a primeira página de tarefas já vem no HTML.
- **Scroll infinito**: mais tarefas carregam ao chegar no fim da lista, com estados de carregando, fim da lista e erro (com nova tentativa).
- Exclusão direto na lista, com estado "excluindo" e mensagem de sucesso ou erro.
- Formulário de criar e editar com validação no cliente e erros do backend (por exemplo, editar uma tarefa que não existe mais).
- Editar um id inexistente mostra uma página 404.

## Tecnologias

| Área | Escolha |
|------|---------|
| Framework | Next.js 15 (App Router), React 19, TypeScript em modo estrito |
| API | tRPC v11 com TanStack Query v5 |
| Validação | zod, compartilhado entre o servidor e o formulário |
| Estilo | Um único `globals.css`, sem biblioteca de UI |
| Testes | vitest |

## Como rodar

Requer **Node.js 22.12 ou mais novo** (o app roda no Node 20+, o executor de testes precisa do 22.12+).

```bash
npm install
npm run dev          # http://localhost:3000
```

Build de produção:

```bash
npm run build && npm start
```

Outros scripts: `npm test` (vitest) e `npm run lint`.

> **Os dados ficam em memória.** Eles reiniciam sempre que o servidor reinicia, e cada início começa com 25 tarefas fictícias para o scroll infinito poder ser testado na hora.

## Estrutura de pastas

A estrutura é a mesma mostrada na versão em inglês acima. Os nomes de arquivos e pastas não são traduzidos.

## API

| Procedure | Tipo | Entrada | Erros |
|-----------|------|---------|-------|
| `tarefa.list` | query | `{ cursor?, limit? }` (limit de 1 a 50, padrão 10) | `BAD_REQUEST` |
| `tarefa.getById` | query | `{ id }` | `NOT_FOUND` |
| `tarefa.create` | mutation | `{ titulo, descricao? }` | `BAD_REQUEST` |
| `tarefa.update` | mutation | `{ id, titulo, descricao? }` | `NOT_FOUND`, `BAD_REQUEST` |
| `tarefa.delete` | mutation | `{ id }` | `NOT_FOUND` |

Uma tarefa é `{ id, titulo, descricao?, dataCriacao }`, onde `dataCriacao` é um timestamp em milissegundos. A lista vem ordenada da mais recente para a mais antiga e retorna `{ items, nextCursor? }`.

## Principais decisões

- **O store fica no `globalThis`.** Em desenvolvimento o Next recarrega os módulos a cada edição, o que zeraria um array comum no módulo e apagaria os dados.
- **Renderização no servidor sem ida e volta por HTTP.** O `page.tsx` chama o router direto, por um caller do tRPC. A página é sempre renderizada a cada requisição (`force-dynamic`), já que os dados mudam.
- **O que o servidor renderiza é a primeira página da query infinita.** Ela entra como `initialData`, então não há "piscada" de carregamento nem nova busca depois da hidratação. A lista descarta o cache ao desmontar (`gcTime: 0`), então voltar do formulário sempre parte de dados novos.
- **Um único schema de validação.** O formulário e o servidor usam o mesmo schema do zod. O servidor valida de novo porque o cliente nunca é a única barreira, e um formatador de erro transforma uma falha do zod na primeira mensagem, em vez de um JSON bruto.
- **Cursor por offset.** Suficiente para uma lista em memória. Com um banco real, um cursor baseado em id ou timestamp seria melhor, porque o offset pode pular ou repetir um item quando linhas são removidas durante a rolagem.
- **Feedback sem biblioteca.** Um pequeno estado renderiza uma mensagem com `role="status"` ou `role="alert"`. A mensagem de exclusão fica na lista, e não no item, porque o item desmonta depois de excluído.
- **Fuso horário fixo nas datas** (`America/Sao_Paulo`), para o servidor e o navegador renderizarem o mesmo texto e a hidratação não divergir.
- **Sem novas tentativas silenciosas em "carregar mais".** O rodapé já oferece um botão de tentar de novo, e as tentativas automáticas do React Query atrasariam o erro por vários segundos.
- **Retorno visual na navegação.** Os links que abrem outra página mostram um pequeno spinner depois de 150 ms, para uma navegação lenta não parecer um clique perdido.

## Testes

`npm test` roda dez testes, nove pelo caller do servidor e um pelo handler HTTP. Eles cobrem os comportamentos de que o app depende:

- títulos em branco são rejeitados, ao criar e ao atualizar;
- um id inexistente dá `NOT_FOUND` em atualizar, excluir e `getById`;
- a paginação devolve o `nextCursor` certo, chega ao fim e nunca repete uma tarefa;
- a tarefa mais nova vem primeiro e o `limit` tem limites;
- uma falha de validação chega ao cliente como uma mensagem legível.

## Fora do escopo, de propósito

Banco de dados, autenticação, Tailwind ou bibliotecas de UI, gerenciadores de estado global, bibliotecas de formulário, bibliotecas de toast, status, prioridade ou tags nas tarefas, busca e filtros, arrastar e soltar, Docker, CI, i18n, modo escuro e animações. Testes de componentes e de ponta a ponta também ficam de fora.

## Limitações conhecidas

- **Os dados não são persistentes.** Eles reiniciam junto com o servidor.
- **A paginação por offset** pode pular ou repetir um item se tarefas forem criadas ou excluídas em outro lugar durante a rolagem (veja acima).
- **O `npm audit` aponta vulnerabilidades no `postcss`**, que vem embutido no Next 15. A correção exige o Next 16, fora do que este projeto mira. É uma dependência de build e não é usada para atender requisições.

</details>
