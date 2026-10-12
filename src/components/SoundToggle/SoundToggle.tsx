"use client";

import { useBoop } from "@/hooks/use-boop";
import { useSoundSetting } from "@/hooks/use-preferences";
import { useSoundEffect } from "@/components/Providers/SoundProvider";
import iconButton from "@/components/IconButton/IconButton.module.css";
import styles from "./SoundToggle.module.css";

export function SoundToggle() {
  const [sound, setSound] = useSoundSetting();
  const playSound = useSoundEffect();
  const [boopStyle, boop] = useBoop({ scale: 1.15, rotation: -10, timing: 150 });

  const label =
    sound === null ? "Alternar sons" : sound === "on" ? "Desativar sons" : "Ativar sons";

  function toggle() {
    const next = sound === "off" ? "on" : "off";
    setSound(next);
    // Feedback audível nos dois sentidos: ao desligar, é o último som que você ouve.
    playSound(next === "on" ? "popUp" : "popDown", { force: true });
  }

  return (
    <button
      type="button"
      className={iconButton.button}
      onClick={toggle}
      onPointerEnter={boop}
      aria-label={label}
      title={label}
    >
      <span className={iconButton.icon} style={boopStyle}>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
          <path className={styles.waveSmall} d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
          <path className={styles.waveLarge} d="M18.5 6.5a7.5 7.5 0 0 1 0 11" />
          <g className={styles.mute}>
            <line x1="16" y1="9.5" x2="21" y2="14.5" />
            <line x1="21" y1="9.5" x2="16" y2="14.5" />
          </g>
        </svg>
      </span>
    </button>
  );
}
