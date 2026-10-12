"use server";

import { EmailRejectedError, addNewsletterContact, escapeHtml, sendEmail } from "@/lib/email";
import { fieldErrors, newsletterSchema, validate, type FormState } from "@/lib/forms";
import { createNewsletterToken, readNewsletterToken } from "@/lib/newsletter-token";
import { site } from "@/lib/site";
import { rateLimit, refundRateLimit } from "@/lib/rate-limit";
import { NotConfiguredError, hashVisitor } from "@/lib/visitor";
import { allowSubmission, looksLikeBot } from "./spam";

export type NewsletterState = FormState<"email">;

/**
 * Passo 1 do double opt-in: valida e manda um e-mail com o link de confirmação.
 * Ninguém entra na lista sem clicar no link — inscrever o e-mail de outra pessoa não
 * tem efeito além de um e-mail que ela pode ignorar.
 */
export async function subscribeToNewsletter(_: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const values = { email: String(formData.get("email") ?? "") };
  // Robô: finge sucesso (não ensina a ele o que deu errado).
  const success: NewsletterState = { status: "success", message: "Quase lá! Confira seu e-mail para confirmar." };
  if (looksLikeBot(formData)) return success;

  const parsed = validate(newsletterSchema, values);
  if (!parsed.success) return { status: "error", errors: fieldErrors(parsed.error), values };

  try {
    const refund = await allowSubmission("newsletter", 5, 60 * 60);
    if (!refund) {
      return { status: "error", message: "Muitas tentativas. Tente de novo mais tarde.", values };
    }
    // Por e-mail também: impede usar o formulário para encher a caixa de alguém
    // (trocando de IP). O excedente é ignorado em silêncio.
    const recipient = hashVisitor(parsed.data.email.toLowerCase());
    if (!(await rateLimit("newsletter-email", recipient, 2, 24 * 60 * 60))) {
      return success;
    }

    const link = `${site.url}/newsletter/confirmar?token=${createNewsletterToken(parsed.data.email)}`;
    try {
      await sendEmail({
        to: parsed.data.email,
        subject: `Confirme sua inscrição — ${site.name}`,
        text: `Oi!\n\nPara receber os novos artigos de ${site.name}, confirme sua inscrição:\n${link}\n\nO link vale por 3 dias. Se não foi você, ignore este e-mail: nada acontece sem a confirmação.`,
        html: `<p>Oi!</p><p>Para receber os novos artigos de ${escapeHtml(site.name)}, confirme sua inscrição:</p><p><a href="${escapeHtml(link)}">Confirmar inscrição</a></p><p>O link vale por 3 dias. Se não foi você, ignore este e-mail: nada acontece sem a confirmação.</p>`,
      });
    } catch (cause) {
      // O e-mail não saiu por falha nossa: nenhuma das duas tentativas conta (veja contact.ts).
      if (!(cause instanceof EmailRejectedError)) {
        await Promise.all([refund(), refundRateLimit("newsletter-email", recipient)]).catch(() => {});
      }
      throw cause;
    }
    return success;
  } catch (cause) {
    console.error("[newsletter] falha ao enviar confirmação", cause);
    const message =
      cause instanceof NotConfiguredError
        ? "A newsletter está indisponível no momento."
        : "Não consegui enviar o e-mail agora. Tente de novo em instantes.";
    return { status: "error", message, values };
  }
}

export type ConfirmState = { status: "idle" | "success" | "error"; message?: string };

/**
 * Passo 2: o leitor abriu o link e clicou em "Confirmar". É um botão (POST), não a
 * simples abertura do link: antivírus de e-mail costumam "visitar" links sozinhos, e
 * isso não pode inscrever ninguém.
 */
export async function confirmNewsletter(_: ConfirmState, formData: FormData): Promise<ConfirmState> {
  const email = readNewsletterToken(String(formData.get("token") ?? ""));
  if (!email) return { status: "error", message: "Este link é inválido ou expirou. Inscreva-se de novo pelo rodapé." };

  try {
    await addNewsletterContact(email);
    return { status: "success", message: `Pronto! ${email} vai receber os próximos artigos.` };
  } catch (cause) {
    console.error("[newsletter] falha ao confirmar", cause);
    return { status: "error", message: "Não consegui confirmar agora. Tente de novo em instantes." };
  }
}
