"use client";

import { useEffect, type RefObject } from "react";
import { springToLinear } from "@/lib/spring";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

type EyeTrackingOptions = {
  /** Quanto os olhos andam no máximo na horizontal (unidades do viewBox do SVG). */
  maxLook: number;
  /** Idem na vertical (padrão: igual ao horizontal). Olhos de conta têm menos espaço para
   *  cima (sobrancelhas) do que para os lados. */
  maxLookY?: number;
  /** Distância (px na tela) a partir da qual o olhar chega ao máximo. */
  reach?: number;
};

// Mola dos olhos: mais rápida que a dos botões (olhos são ágeis), com um leve quique.
const EYE_SPRING = springToLinear({ stiffness: 380, damping: 24 });
// Toque no celular: olha para o ponto por um instante e volta ao centro.
const TOUCH_GLANCE_MS = 1200;
// Tempo para um alvo em movimento (planeta voltando à frente) assentar: a mola do site.
const SETTLE_MS = 850;

/**
 * Olhos que seguem o visitante. Dentro de `rootRef`:
 *   [data-gaze-origin] — de onde os olhos olham (o centro dele é a referência);
 *   [data-gaze]        — o que se move: as pupilas (olho com parte branca) ou o olho
 *                        inteiro (olho de conta). O hook limita o deslocamento.
 *   [data-gaze-follow="0.3"] — acompanha só uma fração do olhar (ex.: sobrancelhas).
 *
 * Para onde olha: o cursor; um [data-look-target] em foco (teclado) ou em hover (ex.: os
 * planetas do hero); o ponto do toque, por um instante; o centro, quando o cursor sai da
 * janela. No máximo uma escrita por quadro (requestAnimationFrame), só transform, listeners
 * passivos, e nada ligado enquanto o mascote estiver fora da tela.
 *
 * É reação ao visitante, não movimento automático: segue mesmo com "Pausar animações".
 * Com "reduzir movimento", vai direto ao ponto final, sem a mola.
 */
export function useEyeTracking(rootRef: RefObject<Element | null>, { maxLook, maxLookY = maxLook, reach = 300 }: EyeTrackingOptions) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const origin = root.querySelector("[data-gaze-origin]") ?? root;
    const movers = [
      ...[...root.querySelectorAll<SVGElement | HTMLElement>("[data-gaze]")].map((element) => ({ element, factor: 1 })),
      ...[...root.querySelectorAll<SVGElement | HTMLElement>("[data-gaze-follow]")].map((element) => ({
        element,
        factor: Number(element.dataset.gazeFollow) || 0,
      })),
    ];
    if (movers.length === 0) return;

    const transition = prefersReducedMotion ? "none" : `transform ${EYE_SPRING.duration}ms ${EYE_SPRING.easing}`;
    for (const { element } of movers) element.style.transition = transition;

    let frame = 0;
    let glance = 0;
    let refocus = 0;
    let target: { x: number; y: number } | null = null; // null = olhar para a frente
    // Alvo explícito (planeta em foco ou sob o mouse): olhar completo na direção dele, mesmo
    // perto do mascote — senão o olhar fica tímido demais para se notar.
    let focused: Element | null = null;
    let hovered: Element | null = null;

    const render = () => {
      frame = 0;
      let x = 0;
      let y = 0;
      const explicit = focused ?? hovered;
      const point = explicit ? center(explicit) : target;
      if (point) {
        const face = center(origin);
        const dx = point.x - face.x;
        const dy = point.y - face.y;
        const distance = Math.hypot(dx, dy) || 1;
        const amount = explicit ? 1 : Math.min(1, distance / reach);
        x = (dx / distance) * amount * maxLook;
        y = (dy / distance) * amount * maxLookY;
      }
      for (const { element, factor } of movers) {
        element.style.transform = `translate(${(x * factor).toFixed(2)}px, ${(y * factor).toFixed(2)}px)`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return; // no toque, só o "relance" do pointerdown
      target = { x: event.clientX, y: event.clientY };
      hovered = (event.target as Element | null)?.closest?.("[data-look-target]") ?? null;
      schedule();
    };
    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      target = { x: event.clientX, y: event.clientY };
      schedule();
      window.clearTimeout(glance);
      glance = window.setTimeout(() => {
        target = null;
        schedule();
      }, TOUCH_GLANCE_MS);
    };
    const onLeaveWindow = (event: PointerEvent) => {
      if (event.relatedTarget) return; // saiu de um elemento para outro, não da janela
      // No toque, o dedo "sai" da tela logo depois de tocar: não é o cursor saindo da janela.
      if (event.pointerType === "touch") return;
      target = null;
      hovered = null;
      schedule();
    };
    const onFocusIn = (event: FocusEvent) => {
      const element = (event.target as Element | null)?.closest?.("[data-look-target]") ?? null;
      focused = element && (event.target as Element).matches(":focus-visible") ? element : null;
      schedule();
      // O alvo pode estar se movendo (planeta dando meia volta): olha de novo quando assentar.
      window.clearTimeout(refocus);
      if (focused) refocus = window.setTimeout(schedule, SETTLE_MS);
    };
    const onFocusOut = () => {
      focused = null;
      schedule();
    };

    const listen = () => {
      const passive = { passive: true } as const;
      window.addEventListener("pointermove", onMove, passive);
      window.addEventListener("pointerdown", onDown, passive);
      document.documentElement.addEventListener("pointerout", onLeaveWindow, passive);
      document.addEventListener("focusin", onFocusIn, passive);
      document.addEventListener("focusout", onFocusOut, passive);
    };
    const unlisten = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerout", onLeaveWindow);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      cancelAnimationFrame(frame);
      frame = 0;
    };

    // Só escuta enquanto o mascote estiver na tela.
    let listening = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !listening) listen();
      if (!entry.isIntersecting && listening) unlisten();
      listening = entry.isIntersecting;
    });
    observer.observe(root);

    return () => {
      observer.disconnect();
      if (listening) unlisten();
      window.clearTimeout(glance);
      window.clearTimeout(refocus);
    };
  }, [rootRef, maxLook, maxLookY, reach, prefersReducedMotion]);
}

function center(element: Element) {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
