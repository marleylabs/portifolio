export const site = {
  name: "Anderson Marley",
  title: "Anderson Marley — Desenvolvedor Fullstack",
  description:
    "Portfólio e blog de Anderson Marley, desenvolvedor fullstack. Artigos sobre web, interfaces e engenharia de produto, e estudos de caso de projetos.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "pt-BR",
  email: "anderson.marley@projetacs.com",
  // Troque pelos seus perfis. Remova uma rede apagando a linha (o rodapé se ajusta).
  social: {
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    x: "https://x.com/",
    bluesky: "https://bsky.app/",
  } as Partial<Record<"github" | "linkedin" | "x" | "bluesky", string>>,
} as const;

/** Textos do hero da home. A palavra em `highlight` ganha o efeito de sparkles. */
export const hero = {
  name: "Anderson",
  role: "Desenvolvedor fullstack que",
  valueProposition: {
    before: "transforma ideias em produtos web",
    highlight: "encantadores",
    after: "— rápidos, acessíveis e cuidados do banco de dados ao último pixel.",
  },
  avatarAlt: "Ilustração de Anderson Marley sorrindo",
} as const;

export const navigation = [
  { href: "/projetos", label: "Projetos" },
  { href: "/artigos", label: "Artigos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
] as const;
