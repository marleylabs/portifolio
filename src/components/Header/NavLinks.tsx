"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type CSSProperties, type FocusEvent } from "react";
import { isArticlePath } from "@/lib/categories";
import { navigation } from "@/lib/site";
import styles from "./Header.module.css";

type Indicator = { x: number; width: number; visible: boolean; instant: boolean };

export function isCurrentPath(pathname: string, href: string) {
  // Artigos vivem em /[categoria]/[slug], fora de /artigos: também contam como "Artigos".
  if (href === "/artigos" && isArticlePath(pathname)) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Links com um fundo arredondado compartilhado que desliza entre eles.
 * A posição vem de offsetLeft/offsetWidth do link sob o cursor (ou com foco); uma única
 * "pílula" anima transform/width com a mola dos tokens. Ao entrar na nav vindo de fora,
 * a pílula aparece direto no link (instant), em vez de atravessar a barra.
 */
export function NavLinks() {
  const pathname = usePathname();
  const [indicator, setIndicator] = useState<Indicator>({ x: 0, width: 0, visible: false, instant: true });

  function moveTo(link: HTMLElement) {
    setIndicator((previous) => ({
      x: link.offsetLeft,
      width: link.offsetWidth,
      visible: true,
      instant: !previous.visible,
    }));
  }

  function hide() {
    setIndicator((previous) => ({ ...previous, visible: false }));
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) hide();
  }

  const pillStyle = {
    "--pill-x": `${indicator.x}px`,
    "--pill-width": `${indicator.width}px`,
  } as CSSProperties;

  return (
    <div className={styles.navTrack} onPointerLeave={hide} onBlur={handleBlur}>
      <span
        className={styles.navPill}
        style={pillStyle}
        data-visible={indicator.visible}
        data-instant={indicator.instant}
        aria-hidden="true"
      />
      <ul className={styles.navList}>
        {navigation.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={styles.navLink}
              aria-current={isCurrentPath(pathname, href) ? "page" : undefined}
              onPointerEnter={(event) => moveTo(event.currentTarget)}
              onFocus={(event) => moveTo(event.currentTarget)}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
