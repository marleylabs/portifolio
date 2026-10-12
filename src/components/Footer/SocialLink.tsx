"use client";

import type { ReactNode } from "react";
import { useBoop, type BoopConfig } from "@/hooks/use-boop";
import styles from "./Footer.module.css";

type SocialLinkProps = {
  href: string;
  label: string;
  icon: ReactNode;
  boop: BoopConfig;
  rel?: string;
};

/** Link de ícone com boop: o hover é no link inteiro, o movimento só no ícone. */
export function SocialLink({ href, label, icon, boop, rel }: SocialLinkProps) {
  const [style, trigger] = useBoop(boop);

  return (
    <a href={href} rel={rel} className={styles.socialLink} aria-label={label} title={label} onPointerEnter={trigger}>
      <span className={styles.socialIcon} style={style}>
        {icon}
      </span>
    </a>
  );
}
