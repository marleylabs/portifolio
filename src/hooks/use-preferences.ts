"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  applySound,
  applyTheme,
  subscribeToRootAttribute,
  type SoundSetting,
  type Theme,
} from "@/lib/preferences";

const subscribeTheme = subscribeToRootAttribute("data-theme");
const subscribeSound = subscribeToRootAttribute("data-sound");

const getTheme = () => (document.documentElement.dataset.theme as Theme | undefined) ?? null;
const getSound = () => (document.documentElement.dataset.sound as SoundSetting | undefined) ?? "on";

/**
 * Tema atual. Retorna `null` no servidor e durante a hidratação — o visual já está certo
 * via CSS; o React só precisa do valor para rótulos de acessibilidade e sons.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => null);
  const setTheme = useCallback((next: Theme) => applyTheme(next, { persist: true, animate: true }), []);
  return [theme, setTheme] as const;
}

export function useSoundSetting() {
  const sound = useSyncExternalStore(subscribeSound, getSound, () => null);
  const setSound = useCallback((next: SoundSetting) => applySound(next), []);
  return [sound, setSound] as const;
}
