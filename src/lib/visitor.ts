import "server-only";

import { createHash } from "node:crypto";

export class NotConfiguredError extends Error {}

/**
 * Identificador anônimo e estável do visitante: sha256(salt secreto + IP).
 * O IP nunca é gravado, e sem o salt o hash não volta a ser um IP.
 */
export function hashVisitor(ip: string) {
  const salt = process.env.VISITOR_SALT ?? (process.env.NODE_ENV !== "production" ? "dev-salt" : undefined);
  if (!salt) throw new NotConfiguredError("Defina VISITOR_SALT (um texto aleatório e secreto).");
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * IP do cliente. Na Vercel, x-forwarded-for é definido pela própria plataforma (não dá
 * para o visitante forjar). Em outro host, confirme que o proxy sobrescreve o cabeçalho.
 */
export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "desconhecido";
}
