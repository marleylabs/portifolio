import type { Metadata } from "next";
import { CosmosLayer } from "@/components/Cosmos/CosmosLayer";
import { NotFoundArt } from "@/components/NotFound/NotFoundArt";
import { OpenSearchButton } from "@/components/NotFound/OpenSearchButton";
import { PushButton } from "@/components/PushButton/PushButton";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className={styles.container}>
      <CosmosLayer variant="lost" />
      <NotFoundArt />
      <h1 className={styles.title}>Essa página saiu para dar uma volta</h1>
      <p className={styles.lead}>
        O endereço pode ter mudado, ou nunca ter existido. O mascote também está procurando — quer ajudar?
      </p>
      <div className={styles.actions}>
        <PushButton href="/">Voltar ao início</PushButton>
        <OpenSearchButton className={styles.search}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <line x1="16" y1="16" x2="20.5" y2="20.5" />
          </svg>
          Buscar no site
        </OpenSearchButton>
      </div>
    </div>
  );
}
