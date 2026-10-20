import "server-only";

import { createHash } from "node:crypto";
import { isIPv6 } from "node:net";

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
 * Endereço do visitante para limites e curtidas, ou null se o pedido não trouxer IP.
 *
 * Na Vercel, x-forwarded-for é sempre definido pela plataforma, que sobrescreve o valor
 * enviado pelo cliente (não dá para forjar). Em outro host, confirme que o proxy faz o
 * mesmo. Sem IP, em produção, o pedido é recusado em vez de cair num balde comum que
 * todos dividiriam; em dev, vira "local".
 *
 * IPv6 conta pelo prefixo /64: uma única conexão costuma receber um bloco /64 inteiro,
 * e trocar de endereço dentro dele não pode render um visitante novo.
 */
export function clientIp(headers: Headers): string | null {
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim();
  if (!ip) return process.env.NODE_ENV === "production" ? null : "local";
  return isIPv6(ip) ? ipv6Network(ip) : ip;
}

function ipv6Network(ip: string) {
  // IPv4 escrito como IPv6 (::ffff:1.2.3.4) é um IPv4 comum.
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
  if (mapped) return mapped[1];

  const [head, tail] = ip.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const groups = [...left, ...Array(8 - left.length - right.length).fill("0"), ...right];
  return `${groups.slice(0, 4).map((group) => parseInt(group, 16).toString(16)).join(":")}::/64`;
}
