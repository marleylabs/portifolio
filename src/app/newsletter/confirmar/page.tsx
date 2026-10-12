import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { ConfirmForm } from "./ConfirmForm";
import styles from "../../entry.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Confirmar inscrição",
  description: "Confirme sua inscrição na newsletter.",
  path: "/newsletter/confirmar",
  noIndex: true,
});

/**
 * Passo 2 do double opt-in. A página é estática; o token vem da URL e é lido no
 * navegador. A inscrição só acontece ao clicar no botão — antivírus de e-mail que
 * "visitam" links sozinhos não inscrevem ninguém.
 */
export default function ConfirmNewsletterPage() {
  return (
    <div className={styles.container}>
      <PageHeader
        eyebrow="Newsletter"
        title="Falta um clique"
        lead="Confirme que você quer receber os próximos artigos por e-mail."
      >
        <Suspense>
          <ConfirmForm />
        </Suspense>
      </PageHeader>
    </div>
  );
}
