import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // CSS em <style> no HTML em vez de <link>: tira ~600ms de CSS bloqueante do LCP
    // (medido no Lighthouse). O CSS do site é pequeno (CSS Modules), então compensa.
    inlineCss: true,
  },
};

export default nextConfig;
