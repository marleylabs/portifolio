export const site = {
  name: "Anderson Marley",
  title: "Anderson Marley · desenvolvedor fullstack",
  description:
    "Anderson Marley, desenvolvedor fullstack que cria sistemas para acabar com trabalho manual. Estudos de caso, como 15 planilhas que viraram uma plataforma.",
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

/** Textos do hero da home. O trecho em `highlight` ganha o efeito de sparkles. */
export const hero = {
  name: "Anderson",
  /** Também é o título da imagem de compartilhamento. */
  intro: "Sou desenvolvedor fullstack e crio sistemas que acabam com trabalho manual.",
  proof: {
    before: "No meu último projeto, 15 planilhas viraram uma plataforma, e uma tarefa de 50 minutos passou a levar",
    highlight: "4",
    after: ".",
  },
  avatarAlt: "Ilustração de Anderson Marley sorrindo",
} as const;

export const navigation = [
  { href: "/projetos", label: "Projetos" },
  { href: "/artigos", label: "Artigos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
] as const;
