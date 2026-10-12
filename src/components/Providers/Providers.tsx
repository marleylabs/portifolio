"use client";

import type { ReactNode } from "react";
import { PreferencesSync } from "./PreferencesSync";
import { SoundProvider } from "./SoundProvider";

/**
 * Providers globais. O Motion de propósito NÃO entra aqui: componentes que precisam dele
 * usam <MotionRoot> localmente, então a lib só é baixada nas páginas que a usam.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SoundProvider>
      <PreferencesSync />
      {children}
    </SoundProvider>
  );
}
