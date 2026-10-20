"use client";

import { useEffect, useRef } from "react";

/**
 * Foco do teclado num planeta escondido atrás do sol: ele dá meia volta na própria órbita
 * (data-reveal → +180° com a mola, no CSS) e aparece na metade da frente, que fica sempre
 * abaixo do rosto do mascote. Assim o foco nunca fica coberto e nenhum planeta passa por
 * cima do rosto. Só eventos de foco; nada por quadro.
 */
export function SolarFocus() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const system = markerRef.current?.parentElement;
    const sun = system?.querySelector("[data-gaze-origin]")?.closest("svg");
    if (!system || !sun) return;

    const onFocusIn = (event: FocusEvent) => {
      const link = (event.target as Element).closest("a[data-look-target]");
      const orbit = link?.closest("li");
      if (!link || !orbit) return;
      for (const other of system.querySelectorAll("li[data-reveal]")) if (other !== orbit) other.removeAttribute("data-reveal");
      if (isBehindSun(link, sun)) orbit.setAttribute("data-reveal", "");
    };
    const onFocusOut = (event: FocusEvent) => {
      if (system.contains(event.relatedTarget as Node | null)) return;
      for (const orbit of system.querySelectorAll("li[data-reveal]")) orbit.removeAttribute("data-reveal");
    };

    system.addEventListener("focusin", onFocusIn);
    system.addEventListener("focusout", onFocusOut);
    return () => {
      system.removeEventListener("focusin", onFocusIn);
      system.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return <span ref={markerRef} hidden />;
}

/**
 * O planeta em foco está escondido pelo sol? Duas condições:
 * 1. está na metade de trás da órbita — a cópia da frente (recortada à metade da frente)
 *    não aparece no centro dele. Não dá para perguntar "o que está por cima": no focusin o
 *    planeta em foco já subiu para a frente do sol (z-index do :focus-visible);
 * 2. está sobre a esfera (distância ao centro menor que o raio).
 * Atrás do sol mas ao lado da esfera, ele aparece normalmente e não precisa girar.
 */
function isBehindSun(planet: Element, sunSvg: Element) {
  const rect = planet.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const orbit = planet.closest("li");
  const frontCopy = orbit?.querySelector('[data-kind="front"] a');
  const inFront = frontCopy ? document.elementsFromPoint(x, y).some((element) => frontCopy.contains(element)) : false;
  if (inFront) return false;

  // Esfera: centro (120,136) e raio 78 no viewBox "10 8 220 220" do mascote.
  const sun = sunSvg.getBoundingClientRect();
  const scale = sun.width / 220;
  const cx = sun.left + (120 - 10) * scale;
  const cy = sun.top + (136 - 8) * scale;
  const body = planet.querySelector("span")?.getBoundingClientRect() ?? rect;
  return Math.hypot(x - cx, y - cy) < 78 * scale + body.width / 2;
}
