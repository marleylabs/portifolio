"use client";

import { useLayoutEffect } from "react";
import {
  applyTheme,
  readStoredSound,
  readStoredTheme,
  syncThemeColor,
  systemTheme,
} from "@/lib/preferences";

/**
 * 1. Reaplica os atributos do <html> após o remount do Strict Mode em desenvolvimento
 *    (o React limpa atributos que não gerencia). Em produção é um no-op.
 * 2. Sem preferência salva, acompanha mudanças do tema do sistema em tempo real.
 */
export function PreferencesSync() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", readStoredTheme() ?? systemTheme());
    root.setAttribute("data-sound", readStoredSound());
    syncThemeColor();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      if (readStoredTheme() !== null) return;
      applyTheme(event.matches ? "dark" : "light", { persist: false, animate: true });
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return null;
}
