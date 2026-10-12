import "server-only";

import { Redis } from "@upstash/redis";

let client: Redis | null | undefined;

/**
 * Cliente Upstash Redis, ou null se não configurado. Aceita os nomes da Upstash e os
 * da integração da Vercel (KV_*).
 */
export function getRedis(): Redis | null {
  if (client !== undefined) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  client = url && token ? new Redis({ url, token }) : null;
  return client;
}

/** Sem Redis, só aceitamos memória em dev ou com LIKES_STORE=memory (testes locais). */
export function memoryFallbackAllowed() {
  return process.env.NODE_ENV !== "production" || process.env.LIKES_STORE === "memory";
}
