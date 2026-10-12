import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { ContactForm } from "@/components/ContactForm/ContactForm";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { site } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Contato",
  description: `Como falar com ${site.name}: formulário, e-mail e redes.`,
  path: "/contato",
});

const NETWORKS = [
  { key: "github", label: "GitHub", note: "código dos projetos e experimentos" },
  { key: "linkedin", label: "LinkedIn", note: "histórico profissional" },
  { key: "x", label: "X", note: "pensamentos curtos" },
  { key: "bluesky", label: "Bluesky", note: "pensamentos curtos" },
] as const;

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <PageHeader
        title="Contato"
        lead="Projeto, oportunidade ou só uma dúvida sobre algum artigo? Minha caixa de entrada está aberta."
      />
      <div className={styles.layout}>
        <ContactForm />
        <aside className={styles.aside} aria-labelledby="outros-canais">
          <h2 id="outros-canais" className={styles.asideTitle}>
            Prefere outro canal?
          </h2>
          <p>
            Escreva direto para <a href={`mailto:${site.email}`}>{site.email}</a>. Costumo responder em até dois
            dias úteis.
          </p>
          <ul className={styles.networks}>
            {NETWORKS.map(({ key, label, note }) => {
              const href = site.social[key];
              if (!href) return null;
              return (
                <li key={key}>
                  <a href={href} rel="me">
                    {label}
                  </a>
                  : {note}
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
