"use client";

import { useEffect, useState } from "react";
import { HONEYPOT_FIELD } from "@/lib/forms";
import styles from "./Forms.module.css";

/**
 * Campos anti-robô, invisíveis para pessoas:
 * - honeypot: fora da tela, fora da ordem de tabulação e escondido de leitores de tela;
 *   o nome "website" atrai robôs que preenchem tudo. Gerenciadores de senha o ignoram
 *   (autocomplete off).
 * - startedAt: quando o formulário apareceu (preenchido no navegador, após montar).
 */
export function SpamTrap() {
  const [startedAt, setStartedAt] = useState("");

  useEffect(() => {
    // Adiado para depois da hidratação: o servidor não sabe o horário do leitor.
    const id = window.setTimeout(() => setStartedAt(String(Date.now())), 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <div className={styles.honeypot} aria-hidden="true">
        <label>
          Deixe este campo em branco
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />
    </>
  );
}
