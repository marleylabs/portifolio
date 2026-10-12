import { buildFeed } from "@/lib/feed";

/** /rss.xml — gerado no build e revalidado a cada 1 hora (cacheLife em lib/feed). */
export async function GET() {
  return new Response(await buildFeed(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
