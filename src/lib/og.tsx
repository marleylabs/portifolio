import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import { site } from "./site";
import { wavePath } from "./waves";

/*
 * Imagens Open Graph (1200×630) geradas no build com next/og (@vercel/og + Satori).
 *
 * As cores não são repetidas aqui: lemos o tema claro direto de src/styles/tokens.css
 * (primeiro valor de cada light-dark()). Mudou um token, mudam as imagens.
 * As fontes são as mesmas do site (pacotes @fontsource, em WOFF — o Satori não lê WOFF2).
 */

export const OG_SIZE = { width: 1200, height: 630 };

const root = process.cwd();
const fontFile = (pkg: string, file: string) => readFile(path.join(root, "node_modules/@fontsource", pkg, "files", file));

const assets = Promise.all([
  fontFile("bricolage-grotesque", "bricolage-grotesque-latin-800-normal.woff"),
  fontFile("atkinson-hyperlegible-next", "atkinson-hyperlegible-next-latin-400-normal.woff"),
  fontFile("atkinson-hyperlegible-next", "atkinson-hyperlegible-next-latin-700-normal.woff"),
  readFile(path.join(root, "src/styles/tokens.css"), "utf8"),
]).then(([heading, body, bodyBold, css]) => {
  const colors = Object.fromEntries(
    [...css.matchAll(/--color-([\w-]+):\s*light-dark\(\s*(#[0-9a-f]{6})/gi)].map(([, name, hex]) => [name, hex]),
  );
  return {
    colors,
    fonts: [
      { name: "Heading", data: heading, weight: 800 as const, style: "normal" as const },
      { name: "Body", data: body, weight: 400 as const, style: "normal" as const },
      { name: "Body", data: bodyBold, weight: 700 as const, style: "normal" as const },
    ],
  };
});

/**
 * Imagem de /public como data URI (o Satori precisa dos bytes, não de uma URL relativa).
 * Com cache: uma leitura de disco sem cache tornaria a rota da imagem dinâmica.
 */
export async function publicImageAsDataUri(src: string) {
  "use cache";
  cacheLife("max");
  const bytes = await readFile(path.join(root, "public", src));
  const type = src.endsWith(".png") ? "image/png" : src.endsWith(".webp") ? "image/webp" : "image/jpeg";
  return `data:${type};base64,${bytes.toString("base64")}`;
}

const WAVES = [
  { d: wavePath({ width: 1200, height: 140, baseline: 50, amplitude: 18, wavelength: 600, phase: 0.6, overscan: 0 }), color: "accent", opacity: 0.25 },
  { d: wavePath({ width: 1200, height: 140, baseline: 80, amplitude: 14, wavelength: 520, phase: 2.4, harmonic: 0.5, overscan: 0 }), color: "primary", opacity: 0.3 },
  { d: wavePath({ width: 1200, height: 140, baseline: 105, amplitude: 10, wavelength: 760, phase: 4.1, overscan: 0 }), color: "sparkle", opacity: 0.35 },
];

type OgImageOptions = {
  eyebrow: string;
  title: string;
  meta?: string;
  /** data URI de uma imagem (capa do projeto) exibida à direita. */
  cover?: string;
};

export async function renderOgImage({ eyebrow, title, meta, cover }: OgImageOptions) {
  const { colors, fonts } = await assets;
  // Títulos longos encolhem para caber em até 3 linhas.
  const titleSize = title.length > 60 ? 54 : title.length > 36 ? 64 : 76;
  const [first, ...rest] = site.name.split(" ");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          backgroundColor: colors.bg,
          backgroundImage: `radial-gradient(circle at 85% 10%, ${colors.accent}22, transparent 45%), radial-gradient(circle at 5% 30%, ${colors.primary}1c, transparent 40%)`,
          fontFamily: "Body",
          color: colors.text,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px 150px", width: cover ? 700 : "100%" }}>
          <div style={{ display: "flex", fontFamily: "Heading", fontSize: 34, letterSpacing: -0.5 }}>
            <span>{first}</span>
            <span style={{ marginLeft: 10, color: colors.primary }}>{rest.join(" ")}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: colors.secondary }}>
              {eyebrow}
            </div>
            <div style={{ marginTop: 16, fontFamily: "Heading", fontSize: titleSize, lineHeight: 1.05, letterSpacing: -1.5 }}>
              {title}
            </div>
            {meta && <div style={{ marginTop: 24, fontSize: 26, color: colors["text-muted"] }}>{meta}</div>}
          </div>
        </div>

        {cover && (
          <div
            style={{
              display: "flex",
              position: "absolute",
              right: 56,
              top: 120,
              width: 440,
              height: 248,
              padding: 10,
              borderRadius: 20,
              backgroundColor: colors.surface,
              boxShadow: "0 24px 60px rgba(31, 27, 46, 0.25)",
              transform: "rotate(3deg)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- Satori só entende <img> */}
            <img src={cover} width={420} height={228} style={{ borderRadius: 12, objectFit: "cover" }} alt="" />
          </div>
        )}

        <svg width="1200" height="140" viewBox="0 0 1200 140" style={{ position: "absolute", left: 0, bottom: 0 }}>
          {WAVES.map(({ d, color, opacity }) => (
            <path key={color} d={d} fill={colors[color]} fillOpacity={opacity} />
          ))}
        </svg>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
