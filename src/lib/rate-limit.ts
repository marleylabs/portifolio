import "server-only";

import { getRedis, memoryFallbackAllowed } from "./redis";
import { NotConfiguredError } from "./visitor";

// INCR + EXPIRE juntos, no Redis: um EXPIRE perdido deixaria o visitante bloqueado para sempre.
const SCRIPT = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end
return count
`;

const memory = new Map<string, { count: number; resetAt: number }>();

/**
 * Janela fixa: até `limit` ações por `windowSeconds` para cada (balde, visitante).
 * Devolve true quando a ação é permitida.
 */
export async function rateLimit(bucket: string, visitor: string, limit: number, windowSeconds: number) {
  const key = `ratelimit:${bucket}:${visitor}`;
  const redis = getRedis();

  if (redis) {
    const count = await redis.eval<[number], number>(SCRIPT, [key], [windowSeconds]);
    return Number(count) <= limit;
  }

  if (!memoryFallbackAllowed()) throw new NotConfiguredError("Defina UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN.");

  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}
