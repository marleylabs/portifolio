import { existsSync } from "node:fs";
import path from "node:path";
import { AvatarClient, type AvatarImages } from "./AvatarClient";

/*
 * Slot do avatar. Coloque os PNGs em public/avatar/:
 *
 *   avatar-light.png        obrigatório (ou só avatar-dark.png — um cobre o outro)
 *   avatar-dark.png         versão para o tema escuro
 *   avatar-blink-light.png  opcional: mesmo desenho com os olhos fechados
 *   avatar-blink-dark.png   opcional: idem, tema escuro
 *
 * Um PNG não tem pálpebras para animar; a "piscada" troca para o frame de olhos
 * fechados por ~150ms. Sem PNG nenhum, entra o mascote SVG provisório.
 * A checagem acontece no build (o site é estático): adicionou arquivos, rebuild.
 */
const FILES = {
  light: "avatar-light.png",
  dark: "avatar-dark.png",
  blinkLight: "avatar-blink-light.png",
  blinkDark: "avatar-blink-dark.png",
} as const;

function publicUrl(file: string) {
  return existsSync(path.join(process.cwd(), "public", "avatar", file)) ? `/avatar/${file}` : null;
}

export function Avatar({ alt }: { alt: string }) {
  const light = publicUrl(FILES.light);
  const dark = publicUrl(FILES.dark);
  const blinkLight = publicUrl(FILES.blinkLight);
  const blinkDark = publicUrl(FILES.blinkDark);

  const images: AvatarImages | null =
    light || dark
      ? {
          light: (light ?? dark)!,
          dark: (dark ?? light)!,
          blinkLight: blinkLight ?? blinkDark,
          blinkDark: blinkDark ?? blinkLight,
        }
      : null;

  return <AvatarClient images={images} alt={alt} />;
}
