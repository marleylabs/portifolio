import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/*
 * CSP sem nonce (guia "Without Nonces" da doc do Next): nonce exige render dinâmico em
 * todas as páginas, e este site é estático. Por isso script-src precisa de
 * 'unsafe-inline' (script de tema e os scripts inline do RSC). O ganho real está no
 * resto: nada de iframes deste site em outros sites, <base>/<object>, formulários ou
 * fetch para fora, e frames só do bundler do Sandpack.
 *   media-src data:  o Howler (use-sound) destrava o áudio com um WAV em data:
 *   frame-src        o preview do <Playground> roda em *.codesandbox.io
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "media-src 'self' data:",
  "connect-src 'self'",
  "frame-src https://*.codesandbox.io",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

// Também limita o que o iframe do Sandpack pode pedir (o `allow` dele não passa disto).
const permissionsPolicy = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "gyroscope=()",
  "accelerometer=()",
  "magnetometer=()",
  "usb=()",
  "hid=()",
  "midi=()",
  "payment=()",
  "xr-spatial-tracking=()",
  "browsing-topics=()",
].join(", ");

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // CSS em <style> no HTML em vez de <link>: tira ~600ms de CSS bloqueante do LCP
    // (medido no Lighthouse). O CSS do site é pequeno (CSS Modules), então compensa.
    inlineCss: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: permissionsPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
