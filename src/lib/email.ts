import "server-only";

import { Resend } from "resend";
import { NotConfiguredError } from "./visitor";

/*
 * Envio de e-mail com Resend.
 *   RESEND_API_KEY      chave da API
 *   RESEND_FROM         remetente num domínio verificado: "Anderson <contato@seu-dominio.dev>"
 *   CONTACT_TO_EMAIL    quem recebe as mensagens do formulário de contato
 *   RESEND_SEGMENT_ID   (opcional) segmento onde entram os inscritos da newsletter
 *
 * Em `npm run dev` sem chave, os e-mails são mostrados no terminal (nada é enviado).
 */

type Email = { to: string; subject: string; text: string; html: string; replyTo?: string };

let client: Resend | null | undefined;

function getResend() {
  if (client === undefined) client = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  return client;
}

const isDevWithoutKey = () => !process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production";

export async function sendEmail({ to, subject, text, html, replyTo }: Email) {
  const resend = getResend();
  if (!resend) {
    if (isDevWithoutKey()) {
      console.info(`\n[email:dev] Para: ${to}\nAssunto: ${subject}\nResponder para: ${replyTo ?? "-"}\n\n${text}\n`);
      return;
    }
    throw new NotConfiguredError("Defina RESEND_API_KEY.");
  }

  const from = process.env.RESEND_FROM;
  if (!from) throw new NotConfiguredError("Defina RESEND_FROM (remetente num domínio verificado no Resend).");

  const { error } = await resend.emails.send({ from, to, subject, text, html, replyTo });
  if (error) throw new Error(`Resend: ${error.message}`);
}

/** Inscreve um e-mail já confirmado (double opt-in) nos contatos do Resend. */
export async function addNewsletterContact(email: string) {
  const resend = getResend();
  if (!resend) {
    if (isDevWithoutKey()) {
      console.info(`[email:dev] Novo inscrito na newsletter: ${email}`);
      return;
    }
    throw new NotConfiguredError("Defina RESEND_API_KEY.");
  }

  const segmentId = process.env.RESEND_SEGMENT_ID;
  const { error } = await resend.contacts.create({
    email,
    unsubscribed: false,
    segments: segmentId ? [{ id: segmentId }] : undefined,
  });
  // Reinscrição de quem já é contato não é erro para quem está se inscrevendo.
  if (error && !/already exists/i.test(error.message)) throw new Error(`Resend: ${error.message}`);
}

export function contactRecipient() {
  const to = process.env.CONTACT_TO_EMAIL;
  if (to) return to;
  if (process.env.NODE_ENV !== "production") return "dev@localhost";
  throw new NotConfiguredError("Defina CONTACT_TO_EMAIL.");
}

/** Texto do usuário dentro de HTML de e-mail: sempre escapado. */
export function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
