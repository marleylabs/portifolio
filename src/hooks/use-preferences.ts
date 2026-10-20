"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  applyMotion,
  applySound,
  applyTheme,
  subscribeToRootAttribute,
  type MotionSetting,
  type SoundSetting,
  type Theme,
} from "@/lib/preferences";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

const subscribeTheme = subscribeToRootAttribute("data-theme");
const subscribeSound = subscribeToRootAttribute("data-sound");
const subscribeMotion = subscribeToRootAttribute("data-motion");

const getTheme = () => (document.documentElement.dataset.theme as Theme | undefined) ?? null;
const getSound = () => (document.documentElement.dataset.sound as SoundSetting | undefined) ?? "on";
const getMotion = () => (document.documentElement.dataset.motion as MotionSetting | undefined) ?? "on";

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

export function useMotionSetting() {
  const motion = useSyncExternalStore(subscribeMotion, getMotion, () => null);
  const setMotion = useCallback((next: MotionSetting) => applyMotion(next), []);
  return [motion, setMotion] as const;
}

/**
 * `true` quando as animações contínuas (que rodam sozinhas, sem o visitante fazer nada)
 * devem ficar paradas: pelo botão "Pausar animações" ou pelo movimento reduzido do
 * sistema. No servidor e na hidratação, `true` (na dúvida, nada se mexe).
 */
export function useAmbientMotionPaused() {
  const [motion] = useMotionSetting();
  const prefersReducedMotion = usePrefersReducedMotion();
  return prefersReducedMotion || motion !== "on";
}
