"use client";

import { useActionState, useId, useRef, useState, type FormEvent } from "react";
import { subscribeToNewsletter, type NewsletterState } from "@/app/actions/newsletter";
import { SpamTrap } from "@/components/Forms/SpamTrap";
import forms from "@/components/Forms/Forms.module.css";
import { EMAIL_MAX_LENGTH, EMAIL_MESSAGES, hasDottedDomain } from "@/lib/form-fields";
import styles from "./Footer.module.css";

/**
 * Inscrição na newsletter (passo 1 do double opt-in). Funciona sem JavaScript (Server
 * Action); com JS, valida antes de enviar com a validação nativa do campo e as mesmas
 * mensagens do servidor. O schema (zod) fica só no servidor: este formulário está no
 * rodapé de todas as páginas e não deve levar o zod junto.
 */
export function NewsletterForm() {
  const [state, formAction, isPending] = useActionState<NewsletterState, FormData>(subscribeToNewsletter, {
    status: "idle",
  });
  const [clientError, setClientError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const errorId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const input = inputRef.current;
    if (!input) return;
    input.value = input.value.trim();
    const { valueMissing, tooLong, typeMismatch } = input.validity;
    const message = valueMissing
      ? EMAIL_MESSAGES.required
      : tooLong
        ? EMAIL_MESSAGES.tooLong
        : typeMismatch || !hasDottedDomain(input.value)
          ? EMAIL_MESSAGES.invalid
          : null;
    setClientError(message);
    if (!message) return; // o servidor ainda confere com o schema completo
    event.preventDefault();
    input.focus();
  }

  if (state.status === "success") {
    return (
      <p className={styles.newsletterSuccess} role="status">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
        </svg>
        {state.message}
      </p>
    );
  }

  const error = clientError ?? state.errors?.email;

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className={styles.newsletterForm}>
      <label htmlFor={inputId} className={forms.label}>
        Seu e-mail
      </label>
      <div className={styles.newsletterRow}>
        <input
          ref={inputRef}
          id={inputId}
          className={forms.input}
          type="email"
          name="email"
          required
          autoComplete="email"
          spellCheck={false}
          maxLength={EMAIL_MAX_LENGTH}
          placeholder="voce@exemplo.com"
          defaultValue={state.values?.email}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onInput={() => clientError && setClientError(null)}
        />
        <button type="submit" className={forms.submit} disabled={isPending}>
          {isPending && <span className={forms.spinner} aria-hidden="true" />}
          {isPending ? "Enviando…" : "Quero receber"}
        </button>
      </div>
      {error && (
        <p id={errorId} className={forms.error}>
          {error}
        </p>
      )}
      {state.status === "error" && state.message && (
        <p className={forms.formMessage} data-status="error" role="alert">
          {state.message}
        </p>
      )}
      <p className={forms.hint}>Um e-mail por artigo novo. Sem spam; cancele quando quiser.</p>
      <SpamTrap />
    </form>
  );
}
