"use client";

import { useActionState, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { sendContactMessage, type ContactState } from "@/app/actions/contact";
import { SpamTrap } from "@/components/Forms/SpamTrap";
import forms from "@/components/Forms/Forms.module.css";
import { useSoundEffect } from "@/components/Providers/SoundProvider";
import { CONTACT_TOPICS, contactSchema, fieldErrors, validate as validateSchema, type ContactFields, type FieldErrors } from "@/lib/forms";
import styles from "./ContactForm.module.css";

const FIELD_ORDER: ContactFields[] = ["name", "email", "topic", "message"];
const MESSAGE_MAX = 5000;

/** Envolve o formulário: "Enviar outra mensagem" remonta tudo (zera o estado da action). */
export function ContactForm() {
  const [round, setRound] = useState(0);
  return <ContactFormInner key={round} onReset={() => setRound((value) => value + 1)} />;
}

function ContactFormInner({ onReset }: { onReset: () => void }) {
  const [state, formAction, isPending] = useActionState<ContactState, FormData>(sendContactMessage, { status: "idle" });
  const [clientErrors, setClientErrors] = useState<FieldErrors<ContactFields>>({});
  const [touched, setTouched] = useState<Partial<Record<ContactFields, boolean>>>({});
  const [messageLength, setMessageLength] = useState(state.values?.message?.length ?? 0);
  const formRef = useRef<HTMLFormElement>(null);
  const playSound = useSoundEffect();
  const baseId = useId();
  const id = (field: string) => `${baseId}-${field}`;

  // Erros do servidor valem até o leitor mexer de novo no campo.
  const errors: FieldErrors<ContactFields> = { ...state.errors, ...clientErrors };

  useEffect(() => {
    if (state.status === "success") playSound("success");
  }, [state.status, playSound]);

  function readForm() {
    const data = new FormData(formRef.current ?? undefined);
    return Object.fromEntries(FIELD_ORDER.map((field) => [field, String(data.get(field) ?? "")]));
  }

  function validate(fields: ContactFields[]) {
    const result = validateSchema(contactSchema, readForm());
    const all = result.success ? {} : fieldErrors<ContactFields>(result.error);
    setClientErrors((current) => {
      const next = { ...current };
      for (const field of fields) {
        if (all[field]) next[field] = all[field];
        else delete next[field];
      }
      return next;
    });
    return all;
  }

  function handleBlur(field: ContactFields) {
    setTouched((current) => ({ ...current, [field]: true }));
    validate([field]);
  }

  function handleChange(field: ContactFields) {
    // Depois do primeiro erro, revalida enquanto digita (o erro some assim que corrigido).
    if (touched[field] || errors[field]) validate([field]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const all = validate(FIELD_ORDER);
    const firstInvalid = FIELD_ORDER.find((field) => all[field]);
    if (!firstInvalid) return;
    event.preventDefault();
    setTouched(Object.fromEntries(FIELD_ORDER.map((field) => [field, true])));
    document.getElementById(id(firstInvalid))?.focus();
  }

  if (state.status === "success") return <ContactSuccess onReset={onReset} />;

  const describedBy = (field: ContactFields, extra?: string) =>
    [errors[field] ? id(`${field}-error`) : null, extra].filter(Boolean).join(" ") || undefined;

  const fieldError = (field: ContactFields) =>
    errors[field] && (
      <p id={id(`${field}-error`)} className={forms.error}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M12 8v5m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {errors[field]}
      </p>
    );

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} noValidate className={styles.form}>
      <div className={styles.row}>
        <div className={forms.field}>
          <label htmlFor={id("name")} className={forms.label}>
            Nome
          </label>
          <input
            id={id("name")}
            name="name"
            className={forms.input}
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            defaultValue={state.values?.name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name")}
            onBlur={() => handleBlur("name")}
            onChange={() => handleChange("name")}
          />
          {fieldError("name")}
        </div>

        <div className={forms.field}>
          <label htmlFor={id("email")} className={forms.label}>
            E-mail
          </label>
          <input
            id={id("email")}
            name="email"
            type="email"
            className={forms.input}
            autoComplete="email"
            required
            defaultValue={state.values?.email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("email")}
            onBlur={() => handleBlur("email")}
            onChange={() => handleChange("email")}
          />
          {fieldError("email")}
        </div>
      </div>

      <div className={forms.field}>
        <label htmlFor={id("topic")} className={forms.label}>
          Assunto
        </label>
        <select
          id={id("topic")}
          name="topic"
          className={forms.input}
          required
          defaultValue={state.values?.topic ?? ""}
          aria-invalid={errors.topic ? true : undefined}
          aria-describedby={describedBy("topic")}
          onBlur={() => handleBlur("topic")}
          onChange={() => handleChange("topic")}
        >
          <option value="" disabled>
            Escolha uma opção
          </option>
          {Object.entries(CONTACT_TOPICS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {fieldError("topic")}
      </div>

      <div className={forms.field}>
        <label htmlFor={id("message")} className={forms.label}>
          Mensagem
        </label>
        <textarea
          id={id("message")}
          name="message"
          className={forms.input}
          required
          minLength={20}
          maxLength={MESSAGE_MAX}
          defaultValue={state.values?.message}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy("message", id("message-count"))}
          onBlur={() => handleBlur("message")}
          onChange={(event) => {
            setMessageLength(event.target.value.length);
            handleChange("message");
          }}
        />
        <div className={styles.messageFooter}>
          {fieldError("message") ?? <span />}
          <p id={id("message-count")} className={forms.hint}>
            {messageLength.toLocaleString("pt-BR")}/{MESSAGE_MAX.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      <SpamTrap />

      <div className={styles.actions}>
        <button type="submit" className={forms.submit} disabled={isPending}>
          {isPending && <span className={forms.spinner} aria-hidden="true" />}
          {isPending ? "Enviando…" : "Enviar mensagem"}
        </button>
        {state.status === "error" && state.message && (
          <p className={forms.formMessage} data-status="error" role="alert">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

/**
 * Sucesso: um aviãozinho de papel sai voando enquanto um círculo e um "check" se
 * desenham. O título recebe o foco, então leitores de tela anunciam o resultado.
 * Com movimento reduzido, tudo aparece já no estado final.
 */
function ContactSuccess({ onReset }: { onReset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className={styles.success}>
      <div className={styles.successArt} aria-hidden="true">
        <svg className={styles.plane} viewBox="0 0 24 24">
          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
        </svg>
        <svg className={styles.check} viewBox="0 0 52 52">
          <circle className={styles.checkCircle} cx="26" cy="26" r="23" />
          <path className={styles.checkMark} d="M15 27l7 7 15-16" />
        </svg>
      </div>
      <h2 ref={headingRef} tabIndex={-1} className={styles.successTitle}>
        Mensagem enviada!
      </h2>
      <p className={styles.successText}>Obrigado por escrever. Costumo responder em até dois dias úteis.</p>
      <button type="button" className={styles.again} onClick={onReset}>
        Enviar outra mensagem
      </button>
    </div>
  );
}
