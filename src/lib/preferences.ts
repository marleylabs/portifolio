/*
 * Preferências do visitante (tema, som e animações).
 *
 * A fonte da verdade é o atributo no <html> (data-theme / data-sound / data-motion), definido por um
 * script inline antes da primeira pintura. O CSS reage a esse atributo, então não há
 * flash; os componentes React apenas leem/escrevem o mesmo atributo.
 */

import { prefersReducedMotion } from "./reduced-motion";

export type Theme = "light" | "dark";
export type SoundSetting = "on" | "off";
/** "paused": animações contínuas (órbitas, respiração, estrelinhas, piscadas) param. */
export type MotionSetting = "on" | "paused";

export const THEME_KEY = "theme";
export const SOUND_KEY = "sound";
export const MOTION_KEY = "motion";

export const THEME_TRANSITION_CLASS = "theme-transition";

/**
 * Executado de forma síncrona no <head>, antes de qualquer bundle — por isso é ES5
 * autocontido. Sem preferência salva (ou sem acesso ao storage), segue o sistema.
 *
 * Também sincroniza <meta name="theme-color"> (barra do navegador no mobile) com a cor
 * de fundo resolvida dos tokens: os stylesheets do <head> bloqueiam scripts, então o
 * CSS já está aplicado aqui e nenhuma cor precisa ser repetida em JS.
 */
export const preferencesScript = `(function(){var d=document.documentElement,t=null,s=null,a=null;try{t=localStorage.getItem("${THEME_KEY}");s=localStorage.getItem("${SOUND_KEY}");a=localStorage.getItem("${MOTION_KEY}")}catch(e){}if(a!=="on"&&a!=="paused"){a=matchMedia("(prefers-reduced-motion: reduce)").matches?"paused":"on"}d.setAttribute("data-motion",a);if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.setAttribute("data-theme",t);d.setAttribute("data-sound",s==="off"?"off":"on");var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement("meta");m.name="theme-color";document.head.appendChild(m)}m.content=getComputedStyle(d).backgroundColor})()`;

export function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Mesma lógica do script inline: a cor vem do CSS resolvido, não de um valor fixo. */
export function syncThemeColor() {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = getComputedStyle(document.documentElement).backgroundColor;
}

let transitionTimer: number | undefined;

/**
 * Liga as transições de cor só durante a troca de tema (classe temporária no <html>).
 * Fora desse momento nada transiciona cor "de graça", e hovers continuam instantâneos.
 */
function enableThemeTransition() {
  const root = document.documentElement;
  if (prefersReducedMotion()) return;

  const duration = parseFloat(getComputedStyle(root).getPropertyValue("--duration-theme")) || 350;
  root.classList.add(THEME_TRANSITION_CLASS);
  window.clearTimeout(transitionTimer);
  transitionTimer = window.setTimeout(
    () => root.classList.remove(THEME_TRANSITION_CLASS),
    duration + 50,
  );
}

export function applyTheme(theme: Theme, { persist, animate }: { persist: boolean; animate: boolean }) {
  if (animate) enableThemeTransition();
  document.documentElement.setAttribute("data-theme", theme);
  syncThemeColor();
  if (!persist) return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Armazenamento indisponível (modo privado etc.): o tema vale só para esta visita.
  }
}

export function readStoredSound(): SoundSetting {
  try {
    return localStorage.getItem(SOUND_KEY) === "off" ? "off" : "on";
  } catch {
    return "on";
  }
}

export function applySound(setting: SoundSetting) {
  document.documentElement.setAttribute("data-sound", setting);
  try {
    localStorage.setItem(SOUND_KEY, setting);
  } catch {
    // Idem: vale só para esta visita.
  }
}

export function applyMotion(setting: MotionSetting) {
  document.documentElement.setAttribute("data-motion", setting);
  try {
    localStorage.setItem(MOTION_KEY, setting);
  } catch {
    // Idem: vale só para esta visita.
  }
}

/** Assina mudanças em um atributo do <html> — base para useSyncExternalStore. */
export function subscribeToRootAttribute(attribute: string) {
  return (callback: () => void) => {
    const observer = new MutationObserver(callback);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [attribute],
    });
    return () => observer.disconnect();
  };
}
