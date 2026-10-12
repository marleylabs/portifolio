import { connection, type NextRequest } from "next/server";
import { z } from "zod";
import { getAllArticles, getAllProjects } from "@/lib/content";
import { MAX_LIKES_PER_VISITOR, getLikesStore, type LikeState } from "@/lib/likes";
import { rateLimit } from "@/lib/rate-limit";
import { NotConfiguredError, clientIp, hashVisitor } from "@/lib/visitor";

/*
 * GET  /api/likes?id=article:css/molas-em-css  → { total, mine }
 * POST /api/likes  { id, count }                → { total, mine }
 *
 * `count` permite agrupar vários cliques num envio (o botão espera uma pausa).
 * As páginas continuam estáticas: só esta rota roda por requisição.
 */

const NO_STORE = { "Cache-Control": "no-store" };

/** Ids aceitos: só conteúdos que existem e têm página aqui (nada de chaves arbitrárias). */
async function likeableIds() {
  const [articles, projects] = await Promise.all([getAllArticles(), getAllProjects()]);
  return new Set([
    ...articles.filter((a) => !a.isExternal).map((a) => `article:${a.id}`),
    ...projects.filter((p) => !p.isExternal).map((p) => `project:${p.id}`),
  ]);
}

function reply(state: LikeState, status = 200) {
  return Response.json(state, { status, headers: NO_STORE });
}

function error(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: NO_STORE });
}

async function handle(request: NextRequest, id: unknown, count: number | null) {
  if (typeof id !== "string" || !(await likeableIds()).has(id)) return error("Conteúdo não encontrado.", 404);
  const ip = clientIp(request.headers);
  if (!ip) return error("Não foi possível identificar a conexão.", 400);

  try {
    const store = getLikesStore();
    const visitor = hashVisitor(ip);
    if (!(await rateLimit("likes", visitor, 30, 60))) return error("Muitas requisições. Tente de novo em um minuto.", 429);
    return reply(count === null ? await store.read(id, visitor) : await store.add(id, visitor, count));
  } catch (cause) {
    if (cause instanceof NotConfiguredError) {
      // Desativado por configuração é um estado, não uma falha: 200 + available:false
      // (um 503 sujaria o console de todo visitante).
      console.warn(`[likes] desativado: ${cause.message}`);
      return Response.json({ available: false }, { headers: NO_STORE });
    }
    console.error("[likes] falha no armazenamento", cause);
    return error("Não foi possível registrar agora.", 502);
  }
}

export async function GET(request: NextRequest) {
  await connection(); // sempre por requisição, nunca pré-renderizado
  return handle(request, request.nextUrl.searchParams.get("id"), null);
}

const postSchema = z.object({
  id: z.string(),
  count: z.number().int().min(1).max(MAX_LIKES_PER_VISITOR),
});

/**
 * Só aceita pedidos feitos pelas páginas deste site. Navegadores mandam Sec-Fetch-Site
 * (e Origin em todo POST); um site de terceiros não consegue escondê-los nem forjá-los.
 * Sem os cabeçalhos (navegador antigo, curl), o pedido passa: o limite por visitante
 * continua valendo.
 */
function fromThisSite(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  await connection();
  if (!fromThisSite(request)) return error("Origem não permitida.", 403);
  // Exatamente JSON: "text/plain; x=application/json" passaria por um "contém" e, sendo um
  // tipo "simples", não dispararia o preflight de CORS.
  const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (type !== "application/json") return error("Envie JSON.", 415);

  const body = postSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return error("Pedido inválido.", 400);
  return handle(request, body.data.id, body.data.count);
}
