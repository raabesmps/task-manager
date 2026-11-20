"use client";

import { useLinkStatus } from "next/link";

// Must be rendered inside a <Link>: useLinkStatus reads the status of the
// nearest parent link. The spinner itself is CSS and only appears after a
// short delay, so fast navigations do not flash it.
export function RotuloLink({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();

  return (
    <span className="rotulo-link" data-pendente={pending} aria-busy={pending}>
      {children}
    </span>
  );
}
