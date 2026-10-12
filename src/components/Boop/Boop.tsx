"use client";

import type { ReactNode } from "react";
import { useBoop, type BoopConfig } from "@/hooks/use-boop";

/**
 * Versão em componente do useBoop, para quando gatilho e alvo são o mesmo elemento.
 * Para "boops desconectados" (hover no botão, animação no ícone), use o hook direto.
 */
export function Boop({ children, ...config }: BoopConfig & { children: ReactNode }) {
  const [style, trigger] = useBoop(config);

  return (
    <span style={{ display: "inline-block", ...style }} onPointerEnter={trigger} onFocusCapture={trigger}>
      {children}
    </span>
  );
}
