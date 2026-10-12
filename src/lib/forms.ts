import * as z from "zod/mini";
import { EMAIL_MAX_LENGTH, EMAIL_MESSAGES } from "./form-fields";

export { HONEYPOT_FIELD, MIN_FILL_MS } from "./form-fields";

/*
 * Schemas dos formulários — os MESMOS no navegador (feedback imediato) e no servidor
 * (a validação que vale). Sem dependências de servidor: pode ser importado por
 * Client Components.
 *
 * zod/mini (e não o zod completo): o completo custava ~30 KB comprimidos de JS. E nem o
 * mini vai para todas as páginas: a newsletter do rodapé valida no navegador com a
 * validação nativa do campo (lib/form-fields) e só o servidor usa o schema.
 * Valide com `validate(schema, dados)`.
 */

const email = z.string().check(
  z.trim(),
  z.minLength(1, EMAIL_MESSAGES.required),
  z.maxLength(EMAIL_MAX_LENGTH, EMAIL_MESSAGES.tooLong),
  z.regex(z.regexes.email, EMAIL_MESSAGES.invalid),
);

export const newsletterSchema = z.object({ email });

export const CONTACT_TOPICS = {
  projeto: "Um projeto",
  oportunidade: "Uma oportunidade de trabalho",
  conversa: "Só quero conversar",
} as const;

export const contactSchema = z.object({
  name: z.string().check(z.trim(), z.minLength(2, "Conte como devo te chamar."), z.maxLength(80, "Use até 80 caracteres.")),
  email,
  topic: z.enum(Object.keys(CONTACT_TOPICS) as [keyof typeof CONTACT_TOPICS], {
    error: "Escolha um assunto.",
  }),
  message: z.string().check(
    z.trim(),
    z.minLength(20, "Escreva pelo menos 20 caracteres."),
    z.maxLength(5000, "Use até 5.000 caracteres."),
  ),
});

/** Valida e devolve os dados (já com trim) ou os erros por campo. */
export function validate<Schema extends z.ZodMiniType>(schema: Schema, data: unknown) {
  return z.safeParse(schema, data);
}

export type ContactFields = keyof z.infer<typeof contactSchema>;
export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

/** Primeiro erro de cada campo, no formato { campo: "mensagem" }. */
export function fieldErrors<Field extends string>(error: {
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>;
}): FieldErrors<Field> {
  const errors: FieldErrors<Field> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as Field;
    errors[field] ??= issue.message;
  }
  return errors;
}

/** Estado devolvido pelas Server Actions dos formulários. */
export type FormState<Field extends string> = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: FieldErrors<Field>;
  /** Valores enviados, para repovoar o formulário se a página recarregar (sem JS). */
  values?: Partial<Record<Field, string>>;
};
