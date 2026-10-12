import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { NotConfiguredError } from "./visitor";

/*
 * Token do double opt-in, sem banco: base64url(e-mail|expiração) + "." + HMAC.
 * Só quem recebeu o e-mail tem o link; alterar o e-mail ou a data invalida a assinatura.
 */

const VALIDITY_MS = 3 * 24 * 60 * 60 * 1000; // 3 dias

function secret() {
  const value = process.env.NEWSLETTER_SECRET ?? (process.env.NODE_ENV !== "production" ? "dev-newsletter" : undefined);
  if (!value) throw new NotConfiguredError("Defina NEWSLETTER_SECRET (um texto aleatório e secreto).");
  return value;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function createNewsletterToken(email: string, now = Date.now()) {
  const payload = Buffer.from(`${email}|${now + VALIDITY_MS}`).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** E-mail do token, ou null se a assinatura não confere ou o link expirou. */
export function readNewsletterToken(token: string, now = Date.now()): string | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  // Último "|": um e-mail pode conter "|" na parte local; a data, não.
  const decoded = Buffer.from(payload, "base64url").toString();
  const separator = decoded.lastIndexOf("|");
  const email = decoded.slice(0, separator);
  const expiresAt = Number(decoded.slice(separator + 1));
  if (separator <= 0 || !(expiresAt > now)) return null;
  return email;
}
