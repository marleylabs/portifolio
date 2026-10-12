import "server-only";

import { headers } from "next/headers";
import { HONEYPOT_FIELD, MIN_FILL_MS } from "@/lib/forms";
import { rateLimit } from "@/lib/rate-limit";
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

export async function allowSubmission(bucket: string, limit: number, windowSeconds: number) {
  const visitor = hashVisitor(clientIp(await headers()));
  return rateLimit(bucket, visitor, limit, windowSeconds);
}
