"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "@/trpc/client";

// Data fetched on the server is reused instead of being refetched right away.
const STALE_TIME_MS = 30_000;

export function Providers({ children }: { children: React.ReactNode }) {
  // useState keeps a single instance across renders; creating the clients
  // inline would reset the query cache on every render.
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: STALE_TIME_MS } } }),
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc" })] }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
