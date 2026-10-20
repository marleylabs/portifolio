"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useAmbientMotionPaused } from "@/hooks/use-preferences";
import { randomBetween, useRandomInterval } from "@/hooks/use-random-interval";
import styles from "./Sparkles.module.css";

type Sparkle = {
  id: number;
  createdAt: number;
  size: number;
  style: CSSProperties;
};

type SparklesProps = {
  children: ReactNode;
  /** Qualquer cor CSS; o padrão vem do token --color-sparkle. */
  color?: string;
  /** Intervalo (ms) entre o surgimento de duas estrelas. */
  minDelay?: number;
  maxDelay?: number;
  /** Quanto tempo (ms) cada estrela vive — deve bater com a animação no CSS. */
  lifetime?: number;
};

let nextId = 0;

function createSparkle(): Sparkle {
  return {
    id: nextId++,
    createdAt: Date.now(),
    size: Math.round(randomBetween(10, 20)),
    style: {
      top: `${randomBetween(-10, 90)}%`,
      left: `${randomBetween(-5, 95)}%`,
      // Algumas estrelas passam por trás do texto, outras por cima: dá profundidade.
      zIndex: Math.random() > 0.5 ? 2 : 0,
    },
  };
}

// Com movimento reduzido: poucas estrelas fixas, em posições previsíveis.
const STATIC_SPARKLES: Sparkle[] = [
  { id: -1, createdAt: 0, size: 14, style: { top: "-12%", left: "-4%", zIndex: 2 } },
  { id: -2, createdAt: 0, size: 11, style: { top: "62%", left: "48%", zIndex: 0 } },
  { id: -3, createdAt: 0, size: 16, style: { top: "-8%", left: "92%", zIndex: 2 } },
];

/**
 * Envolve um trecho com estrelinhas que surgem em posições aleatórias, giram e somem.
 *
 * - As posições são sorteadas só no cliente, depois de montar: sortear no servidor
 *   geraria HTML diferente do cliente (erro de hidratação).
 * - Só gera estrelas enquanto o trecho está visível (IntersectionObserver).
 * - Com prefers-reduced-motion ou "Pausar animações", mostra três estrelas paradas.
 *   Elas estão sempre no HTML e é o CSS que decide exibi-las: decidir no JS fazia as
 *   estrelas fixas aparecerem e sumirem na hidratação para todo mundo.
 * - As estrelas são decorativas (aria-hidden): leitores de tela leem só o texto.
 */
export function Sparkles({
  children,
  color = "var(--color-sparkle)",
  minDelay = 50,
  maxDelay = 450,
  lifetime = 750,
}: SparklesProps) {
  const paused = useAmbientMotionPaused();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting));
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  const isAnimating = isVisible && !paused;

  useRandomInterval(
    () => {
      const now = Date.now();
      setSparkles((current) => [
        ...current.filter((sparkle) => now - sparkle.createdAt < lifetime),
        createSparkle(),
      ]);
    },
    isAnimating ? minDelay : null,
    isAnimating ? maxDelay : null,
  );

  return (
    <span
      ref={wrapperRef}
      className={styles.wrapper}
      style={{ "--sparkle-color": color, "--sparkle-lifetime": `${lifetime}ms` } as CSSProperties}
    >
      {STATIC_SPARKLES.map((sparkle) => (
        <Star key={sparkle.id} {...sparkle} className={`${styles.sparkle} ${styles.static}`} />
      ))}
      {!paused && sparkles.map((sparkle) => <Star key={sparkle.id} {...sparkle} className={styles.sparkle} />)}
      <span className={styles.content}>{children}</span>
    </span>
  );
}

function Star({ size, style, className }: Sparkle & { className: string }) {
  return (
    <span className={className} style={style} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 136 136" fill="none">
        {/* Estrela de quatro pontas com lados côncavos (desenho próprio). */}
        <path d="M68 0Q74 62 136 68Q74 74 68 136Q62 74 0 68Q62 62 68 0Z" fill="currentColor" />
      </svg>
    </span>
  );
}
