import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { Providers } from "@/components/Providers/Providers";
import { preferencesScript } from "@/lib/preferences";
import { site } from "@/lib/site";
import "./globals.css";

// Todo o site é conteúdo estático: o build falha se algo passar a depender de request.
export const ensureStatic = "navigation";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"], // cobre todos os acentos do português; latin-ext seria peso morto
  variable: "--font-bricolage",
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"], // cobre todos os acentos do português; latin-ext seria peso morto
  variable: "--font-atkinson",
  display: "swap",
  // O Next não tem métricas dessa fonte para gerar o fallback ajustado; usamos o do sistema.
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false, // só aparece em páginas com código; não compete com o texto principal.
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  alternates: {
    types: { "application/rss+xml": "/rss.xml" },
  },
};

export const viewport: Viewport = {
  // theme-color não é definido aqui: o script de preferências o cria a partir de
  // --color-bg, então ele segue o tema escolhido (não só o do sistema).
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${bricolage.variable} ${atkinson.variable} ${jetbrains.variable}`}
      // O script abaixo define data-theme/data-sound antes do React hidratar.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencesScript }} />
      </head>
      <body>
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>
        <Providers>
          <Header />
          <main id="conteudo" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
