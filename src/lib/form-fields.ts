/*
 * Constantes dos formulários SEM dependências: podem ir para qualquer página sem levar
 * junto o zod (que fica em lib/forms, usado no servidor e no formulário de contato).
 * O rodapé de todas as páginas (newsletter + SpamTrap) importa só daqui.
 */

/** Campo-isca: invisível para pessoas; robôs que preenchem tudo caem nele. */
export const HONEYPOT_FIELD = "website";
/** Envios mais rápidos que isso (desde que o formulário apareceu) são de robôs. */
export const MIN_FILL_MS = 2000;

export const EMAIL_MAX_LENGTH = 254;
export const EMAIL_MESSAGES = {
  required: "Informe seu e-mail.",
  tooLong: "E-mail longo demais.",
  invalid: "Esse e-mail não parece válido.",
} as const;
