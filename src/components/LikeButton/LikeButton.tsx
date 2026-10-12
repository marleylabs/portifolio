"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useSoundEffect } from "@/components/Providers/SoundProvider";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { Odometer } from "./Odometer";
import { burst, shake, squashAndStretch } from "./particles";
import styles from "./LikeButton.module.css";

const FLUSH_DELAY = 600;
const HEART_PATH =
  "M12 21s-7.4-4.5-9.5-9.2C.9 8.3 3.1 4.6 6.9 4.6c2.1 0 3.6 1.2 5.1 3 1.5-1.8 3-3 5.1-3 3.8 0 6 3.7 4.4 7.2C19.4 16.5 12 21 12 21Z";

type LikeState = { total: number; mine: number };
type Status = "loading" | "ready" | "unavailable";

type LikeButtonProps = {
  /** "article:css/molas-em-css" ou "project:este-portfolio". */
  contentId: string;
  /** Para os textos: "artigo", "estudo de caso"… */
  noun: string;
  /** Limite por visitante; vem do servidor (lib/likes), que é quem o aplica. */
  max: number;
};

/**
 * Botão de curtir (até 10 vezes por visitante).
 *
 * - Otimista: cada clique responde na hora; os cliques são agrupados e enviados após
 *   uma pausa curta. A resposta do servidor (que aplica o limite de verdade) corrige
 *   o estado se preciso.
 * - Cliques pendentes são enviados com keepalive ao sair da página.
 * - Movimento reduzido: sem partículas nem squash; o coração ainda enche (mudança de
 *   cor, não movimento) e o som continua.
 */
export function LikeButton({ contentId, noun, max: MAX }: LikeButtonProps) {
  const [state, setState] = useState<LikeState | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [announcement, setAnnouncement] = useState("");
  const prefersReducedMotion = usePrefersReducedMotion();
  const playSound = useSoundEffect();

  const heartRef = useRef<HTMLSpanElement>(null);
  const particlesRef = useRef<HTMLSpanElement>(null);
  const mineRef = useRef(0);
  const pendingRef = useRef(0);
  const inFlightRef = useRef(false);
  const timerRef = useRef(0);
  const clipId = `${useId()}-heart`;

  // Estado inicial: busca no cliente, então a página continua 100% estática.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/likes?id=${encodeURIComponent(contentId)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((data: LikeState | { available: false }) => {
        if (cancelled) return;
        // Curtidas desativadas no servidor (sem banco configurado): mostra indisponível.
        if ("available" in data) {
          setStatus("unavailable");
          return;
        }
        mineRef.current = data.mine;
        setState({ total: data.total, mine: data.mine });
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("unavailable"));
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  const send = useCallback(
    (count: number, keepalive = false) =>
      fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: contentId, count }),
        keepalive,
      }),
    [contentId],
  );

  // Um envio por vez: com dois em voo, a resposta mais antiga podia chegar por último e
  // fazer o total "voltar". Cliques feitos durante o envio saem logo depois dele.
  const flush = useCallback(async function flushPending(): Promise<void> {
    const count = pendingRef.current;
    if (count === 0 || inFlightRef.current) return;
    pendingRef.current = 0;
    inFlightRef.current = true;
    try {
      const response = await send(count);
      if (!response.ok) throw new Error(String(response.status));
      const data: LikeState = await response.json();
      // Cliques feitos enquanto o pedido viajava continuam pendentes: somamos por cima.
      mineRef.current = data.mine + pendingRef.current;
      setState({ total: data.total + pendingRef.current, mine: mineRef.current });
      setAnnouncement(`Obrigado! ${data.total} curtidas no total.`);
    } catch {
      mineRef.current -= count;
      setState((current) => current && { total: current.total - count, mine: current.mine - count });
      setAnnouncement("Não foi possível registrar a curtida. Tente de novo.");
    } finally {
      inFlightRef.current = false;
    }
    if (pendingRef.current > 0) await flushPending();
  }, [send]);

  // Saindo da página (ou desmontando) com cliques pendentes: envia com keepalive.
  useEffect(() => {
    const sendPending = () => {
      window.clearTimeout(timerRef.current);
      if (pendingRef.current > 0) {
        void send(pendingRef.current, true);
        pendingRef.current = 0;
      }
    };
    const onVisibility = () => document.visibilityState === "hidden" && sendPending();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      sendPending();
    };
  }, [send]);

  function handleClick() {
    if (status !== "ready" || !state) return;

    if (mineRef.current >= MAX) {
      if (!prefersReducedMotion && heartRef.current) shake(heartRef.current);
      setAnnouncement(`Você já deu as ${MAX} curtidas. Obrigado pelo carinho!`);
      return;
    }

    const mine = (mineRef.current += 1);
    pendingRef.current += 1;
    setState((current) => current && { total: current.total + 1, mine });

    // Pitch sobe levemente a cada clique: 1.0 → ~1.6 no décimo.
    playSound("like", { playbackRate: 0.94 + mine * 0.065 });
    if (!prefersReducedMotion) {
      if (heartRef.current) squashAndStretch(heartRef.current);
      if (particlesRef.current) burst(particlesRef.current, mine);
    }

    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(flush, FLUSH_DELAY);
  }

  const mine = state?.mine ?? 0;
  const isFull = mine >= MAX;
  const label =
    status === "unavailable"
      ? "Curtidas indisponíveis no momento"
      : status === "loading" || !state
        ? `Curtir este ${noun}`
        : `Curtir este ${noun}. ${state.total} ${state.total === 1 ? "curtida" : "curtidas"}; você curtiu ${mine} de ${MAX} vezes.`;

  return (
    <div className={styles.wrapper} data-status={status}>
      <button
        type="button"
        className={styles.button}
        onClick={handleClick}
        aria-label={label}
        aria-disabled={status !== "ready" || isFull}
        data-full={isFull}
      >
        <span className={styles.particles} ref={particlesRef} aria-hidden="true" />
        <span className={styles.heart} ref={heartRef} aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <defs>
              <clipPath id={clipId}>
                <path d={HEART_PATH} />
              </clipPath>
              <linearGradient id={`${clipId}-fill`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" style={{ stopColor: "var(--color-primary)" }} />
                <stop offset="100%" style={{ stopColor: "var(--color-mascot-blush)" }} />
              </linearGradient>
            </defs>
            <g clipPath={`url(#${clipId})`}>
              {/* "Líquido": um retângulo que sobe 10% a cada curtida. */}
              <rect
                className={styles.fill}
                x="0"
                y="0"
                width="24"
                height="24"
                fill={`url(#${clipId}-fill)`}
                style={{ transform: `translateY(${(1 - mine / MAX) * 100}%)` }}
              />
            </g>
            <path d={HEART_PATH} className={styles.outline} />
          </svg>
        </span>
      </button>

      <p className={styles.count}>
        {state ? (
          <>
            <Odometer value={state.total} />
            <span className={styles.countLabel}>{state.total === 1 ? "curtida" : "curtidas"}</span>
          </>
        ) : (
          <span className={styles.countLabel}>{status === "unavailable" ? "Indisponível" : "…"}</span>
        )}
      </p>

      <p className={styles.hint}>
        {isFull ? `Você deu as ${MAX} curtidas. Obrigado! 💖` : `Clique até ${MAX} vezes (${mine}/${MAX})`}
      </p>

      <p className="visually-hidden" role="status">
        {announcement}
      </p>
    </div>
  );
}
