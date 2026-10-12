import "server-only";

import type { Redis } from "@upstash/redis";
import { getRedis, memoryFallbackAllowed } from "./redis";
import { NotConfiguredError } from "./visitor";

/*
 * Curtidas: um total por conteúdo e quantas vezes cada visitante curtiu (máx. 10).
 * O visitante é o hash anônimo de lib/visitor (o IP nunca é gravado).
 *
 * Redis:
 *   likes:<conteúdo>:total       → contador total
 *   likes:<conteúdo>:visitors    → hash { <visitante>: curtidas dele }
 */

export const MAX_LIKES_PER_VISITOR = 10;

export type LikeState = { total: number; mine: number };

type LikesStore = {
  read(contentId: string, visitor: string): Promise<LikeState>;
  /** Soma até `requested` curtidas, sem passar do limite do visitante. Atômico. */
  add(contentId: string, visitor: string, requested: number): Promise<LikeState>;
};

const keysFor = (contentId: string) => ({
  total: `likes:${contentId}:total`,
  visitors: `likes:${contentId}:visitors`,
});

/*
 * Lua roda inteiro dentro do Redis, sem nada entre a leitura e a escrita: dois cliques
 * simultâneos do mesmo visitante não conseguem furar o limite de 10.
 */
const ADD_SCRIPT = `
local current = tonumber(redis.call("HGET", KEYS[2], ARGV[1]) or "0")
local allowed = math.min(tonumber(ARGV[2]), tonumber(ARGV[3]) - current)
if allowed > 0 then
  redis.call("HINCRBY", KEYS[2], ARGV[1], allowed)
  redis.call("INCRBY", KEYS[1], allowed)
else
  allowed = 0
end
return { tonumber(redis.call("GET", KEYS[1]) or "0"), current + allowed }
`;

function upstashStore(redis: Redis): LikesStore {
  return {
    async read(contentId, visitor) {
      const keys = keysFor(contentId);
      const [total, mine] = await Promise.all([
        redis.get<number>(keys.total),
        redis.hget<number>(keys.visitors, visitor),
      ]);
      return { total: Number(total ?? 0), mine: Number(mine ?? 0) };
    },
    async add(contentId, visitor, requested) {
      const keys = keysFor(contentId);
      const [total, mine] = await redis.eval<[string, number, number], [number, number]>(
        ADD_SCRIPT,
        [keys.total, keys.visitors],
        [visitor, requested, MAX_LIKES_PER_VISITOR],
      );
      return { total: Number(total), mine: Number(mine) };
    },
  };
}

/**
 * Armazenamento em memória: só para desenvolvimento local (ou LIKES_STORE=memory).
 * Some ao reiniciar o servidor e não é compartilhado entre instâncias.
 */
function memoryStore(): LikesStore {
  const totals = new Map<string, number>();
  const visitors = new Map<string, number>();

  return {
    async read(contentId, visitor) {
      return { total: totals.get(contentId) ?? 0, mine: visitors.get(`${contentId}|${visitor}`) ?? 0 };
    },
    async add(contentId, visitor, requested) {
      const key = `${contentId}|${visitor}`;
      const current = visitors.get(key) ?? 0;
      const allowed = Math.max(0, Math.min(requested, MAX_LIKES_PER_VISITOR - current));
      visitors.set(key, current + allowed);
      totals.set(contentId, (totals.get(contentId) ?? 0) + allowed);
      return { total: totals.get(contentId) ?? 0, mine: current + allowed };
    },
  };
}

// Sobrevive ao hot reload do `next dev` (o módulo é reavaliado; o globalThis não).
const globalForLikes = globalThis as unknown as { likesMemoryStore?: LikesStore };

export function getLikesStore(): LikesStore {
  const redis = getRedis();
  if (redis) return upstashStore(redis);

  if (memoryFallbackAllowed()) {
    globalForLikes.likesMemoryStore ??= memoryStore();
    return globalForLikes.likesMemoryStore;
  }

  throw new NotConfiguredError("Defina UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN.");
}
