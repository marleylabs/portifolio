"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { confirmNewsletter, type ConfirmState } from "@/app/actions/newsletter";
import forms from "@/components/Forms/Forms.module.css";
import styles from "./page.module.css";

export function ConfirmForm() {
  const token = useSearchParams().get("token") ?? "";
  const [state, formAction, isPending] = useActionState<ConfirmState, FormData>(confirmNewsletter, { status: "idle" });

  if (!token) {
    return (
      <p className={forms.formMessage} data-status="error">
        Link incompleto. Abra o link do e-mail de confirmação de novo.
      </p>
    );
  }

  if (state.status !== "idle") {
    return (
      <div className={styles.result} data-status={state.status} role="status">
        <p>{state.message}</p>
        <Link href="/artigos">Todos os artigos →</Link>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="token" value={token} />
      <button type="submit" className={forms.submit} disabled={isPending}>
        {isPending && <span className={forms.spinner} aria-hidden="true" />}
        {isPending ? "Confirmando…" : "Confirmar inscrição"}
      </button>
    </form>
  );
}
