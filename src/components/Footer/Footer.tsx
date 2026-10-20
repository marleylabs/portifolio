import Link from "next/link";
import { EntryLink } from "@/components/EntryLink/EntryLink";
import { BlueskyIcon, GitHubIcon, LinkedInIcon, RssIcon, XIcon } from "@/components/icons/SocialIcons";
import { getAllProjects, getArticleCategories } from "@/lib/content";
import { site } from "@/lib/site";
import { wavePath } from "@/lib/waves";
import { NewsletterForm } from "./NewsletterForm";
import { SocialLink } from "./SocialLink";
import styles from "./Footer.module.css";

const SOCIAL = [
  { key: "github", label: "GitHub", Icon: GitHubIcon, boop: { rotation: 12, scale: 1.1 } },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedInIcon, boop: { y: -3, scale: 1.1 } },
  { key: "x", label: "X", Icon: XIcon, boop: { rotation: -12, scale: 1.1 } },
  { key: "bluesky", label: "Bluesky", Icon: BlueskyIcon, boop: { y: -4, rotation: 8 } },
] as const;

const GENERAL = [
  { href: "/", label: "Início" },
  { href: "/artigos", label: "Artigos" },
  { href: "/projetos", label: "Projetos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
] as const;

const WAVE = wavePath({ width: 1440, height: 80, baseline: 40, amplitude: 14, wavelength: 720, phase: 1.1, harmonic: 0.3, overscan: 0 });

export async function Footer() {
  const [categories, projects] = await Promise.all([getArticleCategories(), getAllProjects()]);

  return (
    <footer className={styles.footer}>
      {/* Onda decorativa: o fundo do rodapé "sobe" ondulado sobre o conteúdo. */}
      <svg className={styles.wave} viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d={WAVE} />
      </svg>

      <div className={styles.inner}>
        <div className={styles.top}>
          <section className={styles.newsletter} aria-labelledby="newsletter-title">
            <h2 id="newsletter-title" className={styles.newsletterTitle}>
              Receba os próximos artigos
            </h2>
            <p className={styles.newsletterLead}>
              Escrevo sobre interfaces, animação e engenharia de produto. Chega no seu e-mail quando sai.
            </p>
            <NewsletterForm />
          </section>

          <nav className={styles.columns} aria-label="Rodapé">
            <div>
              <h2 className={`label ${styles.columnTitle}`}>Categorias</h2>
              <ul className={styles.columnList}>
                {categories.map(({ key, label }) => (
                  <li key={key}>
                    <Link href={`/${key}`}>{label}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/artigos">Todos os artigos</Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className={`label ${styles.columnTitle}`}>Projetos</h2>
              <ul className={styles.columnList}>
                {projects.slice(0, 4).map((project) => (
                  <li key={project.id}>
                    <EntryLink href={project.href} isExternal={project.isExternal}>
                      {project.title}
                    </EntryLink>
                  </li>
                ))}
                <li>
                  <Link href="/projetos">Todos os projetos</Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className={`label ${styles.columnTitle}`}>Geral</h2>
              <ul className={styles.columnList}>
                {GENERAL.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © 2026 {site.name}. Feito com Next.js, MDX e muito café.
          </p>
          <ul className={styles.links} aria-label="Redes sociais e feed">
            {SOCIAL.map(({ key, label, Icon, boop }) => {
              const href = site.social[key];
              if (!href) return null;
              return (
                <li key={key}>
                  <SocialLink href={href} rel="me" label={label} icon={<Icon />} boop={boop} />
                </li>
              );
            })}
            <li>
              <SocialLink href="/rss.xml" label="Feed RSS" icon={<RssIcon />} boop={{ rotation: 15, x: 2 }} />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
