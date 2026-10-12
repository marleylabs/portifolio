"use server";

import { contactRecipient, escapeHtml, sendEmail } from "@/lib/email";
import { CONTACT_TOPICS, contactSchema, fieldErrors, validate, type ContactFields, type FormState } from "@/lib/forms";
import { site } from "@/lib/site";
import { NotConfiguredError } from "@/lib/visitor";
import { allowSubmission, looksLikeBot } from "./spam";

export type ContactState = FormState<ContactFields>;

/**
 * Envia a mensagem do formulário para CONTACT_TO_EMAIL via Resend, com "Responder
 * para" apontando para quem escreveu. A validação é a mesma do navegador (lib/forms),
 * mas aqui é a que vale.
 */
export async function sendContactMessage(_: ContactState, formData: FormData): Promise<ContactState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    topic: String(formData.get("topic") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  const success: ContactState = { status: "success" };
  if (looksLikeBot(formData)) return success;

  const parsed = validate(contactSchema, values);
  if (!parsed.success) {
    return { status: "error", message: "Confira os campos destacados.", errors: fieldErrors(parsed.error), values };
  }

  try {
    if (!(await allowSubmission("contact", 3, 60 * 60))) {
      return { status: "error", message: "Você já enviou várias mensagens. Tente de novo mais tarde.", values };
    }

    const { name, email, topic, message } = parsed.data;
    const topicLabel = CONTACT_TOPICS[topic];
    await sendEmail({
      to: contactRecipient(),
      replyTo: email,
      subject: `[${site.name}] ${topicLabel} — ${name}`,
      text: `Nome: ${name}\nE-mail: ${email}\nAssunto: ${topicLabel}\n\n${message}`,
      html: `<p><strong>Nome:</strong> ${escapeHtml(name)}<br><strong>E-mail:</strong> ${escapeHtml(email)}<br><strong>Assunto:</strong> ${escapeHtml(topicLabel)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });
    return success;
  } catch (cause) {
    console.error("[contato] falha ao enviar", cause);
    const message =
      cause instanceof NotConfiguredError
        ? `O formulário está indisponível no momento. Escreva para ${site.email}.`
        : `Não consegui enviar agora. Tente de novo ou escreva para ${site.email}.`;
    return { status: "error", message, values };
  }
}
