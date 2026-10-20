import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { AboutPhoto } from "@/components/About/AboutPhoto";
import { StackGrid } from "@/components/About/StackGrid";
import { Timeline } from "@/components/About/Timeline";
import prose from "@/components/Prose/Prose.module.css";
import { getAboutPage } from "@/lib/content";
import { MDXContent } from "@/lib/mdx";
import { site } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Sobre",
  description: `Quem é ${site.name} e com que tecnologias trabalha hoje.`,
  path: "/sobre",
});

/** Conteúdo em content/pages/sobre.mdx (texto no corpo; foto, linha do tempo e stack no frontmatter). */
export default async function AboutPage() {
  const about = await getAboutPage();
  // Itens de exemplo da linha do tempo não vão ao ar: sem itens reais, a seção some.
  const timeline = about.timeline.filter((item) => !item.example);

  return (
    <div className={styles.container}>
      <section className={styles.intro} aria-labelledby="sobre-titulo">
        <div className={styles.introText}>
          <h1 id="sobre-titulo" className={styles.title}>
            {about.title}
          </h1>
          <p className={styles.lead}>{about.lead}</p>
          <div className={prose.prose}>
            <MDXContent source={about.body} />
          </div>
        </div>
        <AboutPhoto photo={about.photo} />
      </section>

      {timeline.length > 0 && (
        <section className={styles.section} aria-labelledby="trajetoria">
          <h2 id="trajetoria" className={styles.sectionTitle}>
            Trajetória
          </h2>
          <Timeline items={timeline} />
        </section>
      )}

      <section className={styles.section} aria-labelledby="stack-atual">
        <h2 id="stack-atual" className={styles.sectionTitle}>
          Stack atual
        </h2>
        <StackGrid groups={about.stack} />
      </section>
    </div>
  );
}
