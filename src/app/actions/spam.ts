import "server-only";

import { headers } from "next/headers";
import { HONEYPOT_FIELD, MIN_FILL_MS } from "@/lib/forms";
import { rateLimit, refundRateLimit } from "@/lib/rate-limit";
import { clientIp, hashVisitor } from "@/lib/visitor";

/**
 * Camadas anti-spam dos formulários (nenhuma incomoda pessoas):
 *  1. honeypot: campo invisível que só robôs preenchem;
 *  2. tempo mínimo: robôs enviam instantaneamente. O horário vem de um campo que o
 *     navegador preenche ao montar o formulário; sem JS ele fica vazio e a checagem é
 *     pulada (não punimos quem navega sem JavaScript);
 *  3. rate limit por visitante (hash do IP).
 */
export function looksLikeBot(formData: FormData) {
  if (String(formData.get(HONEYPOT_FIELD) ?? "").length > 0) return true;
  const startedAt = Number(formData.get("startedAt"));
  return Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS;
}

/**
 * Conta um envio do visitante. Devolve null se ele passou do limite; senão, uma função
 * que desfaz a contagem (para quando o envio falha por culpa nossa, não dele).
 */
export async function allowSubmission(bucket: string, limit: number, windowSeconds: number) {
  const ip = clientIp(await headers());
  if (!ip) throw new Error("Pedido sem IP do cliente: confira o proxy.");
  const visitor = hashVisitor(ip);
  if (!(await rateLimit(bucket, visitor, limit, windowSeconds))) return null;
  return () => refundRateLimit(bucket, visitor);
}
