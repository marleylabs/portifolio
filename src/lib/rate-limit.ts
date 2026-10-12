import "server-only";

import { getRedis, memoryFallbackAllowed } from "./redis";
import { NotConfiguredError } from "./visitor";

// INCR + EXPIRE juntos, no Redis: um EXPIRE perdido deixaria o visitante bloqueado para sempre.
const SCRIPT = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end
return count
`;

// Só devolve se a janela ainda existe: DECR numa chave vencida a recriaria sem EXPIRE.
const REFUND_SCRIPT = `
if redis.call("EXISTS", KEYS[1]) == 1 then return redis.call("DECR", KEYS[1]) end
return 0
`;

const memory = new Map<string, { count: number; resetAt: number }>();
// Acima disso, cada nova entrada varre as vencidas (o mapa não cresce sem fim em dev).
const MEMORY_SWEEP_AT = 1000;

const keyFor = (bucket: string, visitor: string) => `ratelimit:${bucket}:${visitor}`;

/**
 * Janela fixa: até `limit` ações por `windowSeconds` para cada (balde, visitante).
 * Devolve true quando a ação é permitida.
 */
export async function rateLimit(bucket: string, visitor: string, limit: number, windowSeconds: number) {
  const key = keyFor(bucket, visitor);
  const redis = getRedis();

  if (redis) {
    const count = await redis.eval<[number], number>(SCRIPT, [key], [windowSeconds]);
    return Number(count) <= limit;
  }

  if (!memoryFallbackAllowed()) throw new NotConfiguredError("Defina UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN.");

  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt < now) {
    if (memory.size >= MEMORY_SWEEP_AT) {
      for (const [k, v] of memory) if (v.resetAt < now) memory.delete(k);
    }
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

/** Devolve uma ação contada por `rateLimit` que não chegou a acontecer (ex.: o envio falhou). */
export async function refundRateLimit(bucket: string, visitor: string) {
  const key = keyFor(bucket, visitor);
  const redis = getRedis();
  if (redis) {
    await redis.eval(REFUND_SCRIPT, [key], []);
    return;
  }
  const entry = memory.get(key);
  if (entry && entry.count > 0) entry.count -= 1;
}
