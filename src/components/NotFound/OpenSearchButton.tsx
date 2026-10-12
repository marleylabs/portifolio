"use client";

import type { ReactNode } from "react";
import { OPEN_SEARCH_EVENT } from "@/components/Search/events";

/** Abre a busca do header (o componente Search escuta este evento). */
export function OpenSearchButton({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}>
      {children}
    </button>
  );
}
