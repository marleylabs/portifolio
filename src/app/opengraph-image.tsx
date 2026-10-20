import { OG_SIZE, renderOgImage } from "@/lib/og";
import { hero, site } from "@/lib/site";

export const alt = `${site.name}: desenvolvedor fullstack — portfólio e artigos`;
export const size = OG_SIZE;
export const contentType = "image/png";

/** Imagem padrão de compartilhamento (home e páginas sem imagem própria). */
export default function Image() {
  return renderOgImage({
    eyebrow: "Portfólio e artigos",
    title: hero.intro,
    meta: site.url.replace(/^https?:\/\//, ""),
  });
}
