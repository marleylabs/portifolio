"use client";

import { useSyncExternalStore } from "react";
import { REDUCED_MOTION_QUERY } from "@/lib/reduced-motion";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

/**
 * `true` quando o usuário pediu menos movimento no sistema. Reage a mudanças ao vivo.
 *
 * No servidor (e durante a hidratação) devolve `true`: na dúvida, nada se mexe. Depois
 * da hidratação o valor real assume — o pior caso é uma animação a menos, nunca uma a
 * mais para quem tem sensibilidade a movimento.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
