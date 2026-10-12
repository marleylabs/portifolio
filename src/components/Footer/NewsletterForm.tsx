"use client";

import { useActionState, useId, useRef, useState, type FormEvent } from "react";
import { subscribeToNewsletter, type NewsletterState } from "@/app/actions/newsletter";
import { SpamTrap } from "@/components/Forms/SpamTrap";
import forms from "@/components/Forms/Forms.module.css";
import { newsletterSchema, validate } from "@/lib/forms";
import styles from "./Footer.module.css";

/**
 * Inscrição na newsletter (passo 1 do double opt-in). Funciona sem JavaScript (Server
 * Action); com JS, valida antes de enviar usando o mesmo schema do servidor.
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
    const result = validate(newsletterSchema, { email: inputRef.current?.value ?? "" });
    if (result.success) {
      setClientError(null);
      return;
    }
    event.preventDefault();
    setClientError(result.error.issues[0].message);
    inputRef.current?.focus();
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
          placeholder="voce@exemplo.com"
          defaultValue={state.values?.email}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onInput={() => clientError && setClientError(null)}
        />
        <button type="submit" className={forms.submit} disabled={isPending}>
          {isPending && <span className={forms.spinner} aria-hidden="true" />}
          {isPending ? "Enviando…" : "Inscrever"}
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
