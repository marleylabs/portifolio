import { describe, expect, it } from "vitest";
import { hasDottedDomain } from "@/lib/form-fields";
import { newsletterSchema, validate } from "@/lib/forms";

const serverAccepts = (email: string) => validate(newsletterSchema, { email }).success;

describe("hasDottedDomain (checagem do navegador, sem zod)", () => {
  it.each(["ana@exemplo.com", "ana.silva@sub.exemplo.com.br", "a|b@exemplo.dev"])("aceita %s", (email) => {
    expect(hasDottedDomain(email)).toBe(true);
  });

  it.each(["ana@exemplo", "ana@exemplo.", "ana@.com", "ana@exemplo..com", "anaexemplo.com", "ana@"])("recusa %s", (email) => {
    expect(hasDottedDomain(email)).toBe(false);
  });

  it("recusa no navegador tudo o que o servidor recusaria por falta de ponto no domínio", () => {
    for (const email of ["ana@exemplo", "ana@localhost", "ana@exemplo."]) {
      expect(serverAccepts(email)).toBe(false);
      expect(hasDottedDomain(email)).toBe(false);
    }
  });
});
