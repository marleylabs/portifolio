"use client";

import type { ReactNode } from "react";
import { PreferencesSync } from "./PreferencesSync";
import { SoundProvider } from "./SoundProvider";

/**
 * Providers globais. O Motion de propósito NÃO entra aqui: só o explorador de projetos
 * o usa, e a lib só é baixada lá.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SoundProvider>
      <PreferencesSync />
      {children}
    </SoundProvider>
  );
}
