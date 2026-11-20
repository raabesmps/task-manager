import type { Metadata } from "next";
import Link from "next/link";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gerenciador de Tarefas",
  description: "Task manager built with Next.js 15 and tRPC",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="site-header">
          <Link href="/">Gerenciador de Tarefas</Link>
        </header>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
