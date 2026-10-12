"use client";

import { useEffect, useRef } from "react";

export const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

/**
 * Como setInterval, mas cada espera é sorteada entre `minDelay` e `maxDelay` — ritmos
 * irregulares parecem orgânicos (piscadas, brilhos). Passe `null` para pausar.
 */
export function useRandomInterval(callback: () => void, minDelay: number | null, maxDelay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (minDelay === null || maxDelay === null) return;
    let timeoutId = 0;

    const scheduleNext = () => {
      timeoutId = window.setTimeout(() => {
        savedCallback.current();
        scheduleNext();
      }, randomBetween(minDelay, maxDelay));
    };

    scheduleNext();
    return () => window.clearTimeout(timeoutId);
  }, [minDelay, maxDelay]);
}
