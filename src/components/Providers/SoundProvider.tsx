"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import useSound from "use-sound";
import { useSoundSetting } from "@/hooks/use-preferences";
import { SOUND_SPRITE, type SoundName } from "@/lib/sound-sprite";

type PlayOptions = {
  force?: boolean;
  /** 1 = normal; >1 = mais agudo (e mais rápido). */
  playbackRate?: number;
};
type PlaySound = (name: SoundName, options?: PlayOptions) => void;
type Howl = NonNullable<ReturnType<typeof useSound>[1]["sound"]>;

const SoundContext = createContext<PlaySound>(() => {});

/** Um som pedido enquanto o áudio carrega só toca se ainda fizer sentido (logo após o gesto). */
const MAX_QUEUE_AGE_MS = 700;

/**
 * Sons do site, com três garantias:
 *
 * 1. Nada de áudio antes de um gesto do usuário. O sprite (e o Howler) só são baixados,
 *    e o AudioContext só é criado, no primeiro clique/toque/tecla — antes disso não há
 *    o que tocar, e o navegador bloquearia o áudio de qualquer forma.
 * 2. Mudo de verdade: com o som desligado (preferência salva), o arquivo nem é baixado.
 * 3. Pitch por reprodução: tocamos pelo Howl e aplicamos rate(x, id) só ao som atual —
 *    o `rate` global do use-sound quebra com sprites (bug conhecido do Howler).
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [sound] = useSoundSetting();
  const [armed, setArmed] = useState(false);
  const howlRef = useRef<Howl | null>(null);
  const queuedRef = useRef<{ name: SoundName; rate: number; at: number } | null>(null);
  // Lido dentro do callback: assim playSound nunca muda de identidade e ligar/desligar
  // o som não re-renderiza todos os componentes que tocam sons.
  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  // Arma o áudio no primeiro gesto (se o som estiver ligado).
  useEffect(() => {
    if (armed || sound !== "on") return;
    const arm = () => setArmed(true);
    const options = { capture: true, once: true, passive: true } as const;
    window.addEventListener("pointerdown", arm, options);
    window.addEventListener("keydown", arm, options);
    return () => {
      window.removeEventListener("pointerdown", arm, options);
      window.removeEventListener("keydown", arm, options);
    };
  }, [armed, sound]);

  const playNow = useCallback((howl: Howl, name: SoundName, rate: number) => {
    howl.stop(); // um som por vez: cliques rápidos não empilham
    const id = howl.play(name);
    howl.rate(rate, id);
  }, []);

  const handleReady = useCallback(
    (howl: Howl) => {
      howlRef.current = howl;
      const queued = queuedRef.current;
      queuedRef.current = null;
      if (queued && performance.now() - queued.at < MAX_QUEUE_AGE_MS) playNow(howl, queued.name, queued.rate);
    },
    [playNow],
  );

  const playSound = useCallback<PlaySound>(
    (name, options) => {
      if (soundRef.current !== "on" && !options?.force) return;
      const rate = options?.playbackRate ?? 1;
      if (howlRef.current) {
        playNow(howlRef.current, name, rate);
        return;
      }
      // Ainda carregando (ou ligando o som agora): guarda e arma.
      queuedRef.current = { name, rate, at: performance.now() };
      setArmed(true);
    },
    [playNow],
  );

  return (
    <SoundContext.Provider value={playSound}>
      {armed && <SoundEngine onReady={handleReady} />}
      {children}
    </SoundContext.Provider>
  );
}

/** Montado só depois do primeiro gesto: aí sim o use-sound baixa o sprite e cria o Howl. */
function SoundEngine({ onReady }: { onReady: (howl: Howl) => void }) {
  const [, { sound: howl }] = useSound("/sounds/sprite.wav", {
    sprite: SOUND_SPRITE as unknown as Record<SoundName, [number, number]>,
    volume: 0.35,
  });

  useEffect(() => {
    if (howl) onReady(howl);
  }, [howl, onReady]);

  return null;
}

/** Toca um efeito do sprite. Respeita a preferência de som, a menos que `force` seja usado. */
export function useSoundEffect() {
  return useContext(SoundContext);
}
