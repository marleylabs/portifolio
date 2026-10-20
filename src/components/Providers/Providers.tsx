"use client";

import type { ReactNode } from "react";
import { PreferencesSync } from "./PreferencesSync";
import { SoundProvider } from "./SoundProvider";

/**
 * Providers globais: só preferências e som. Nada de biblioteca de animação; as molas
 * são CSS (--ease-spring) e o filtro de projetos usa View Transitions nativas.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SoundProvider>
      <PreferencesSync />
      {children}
    </SoundProvider>
  );
}
