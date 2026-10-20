import { beforeEach, describe, expect, it, vi } from "vitest";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { sendEmail } from "@/lib/email";
import { createNewsletterToken, readNewsletterToken } from "@/lib/newsletter-token";

let ip = "";
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": ip }) }));
vi.mock("@/lib/email", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/email")>()),
  sendEmail: vi.fn(),
}));

const send = vi.mocked(sendEmail);
const DAY = 24 * 60 * 60 * 1000;

describe("token do double opt-in", () => {
  const now = Date.UTC(2026, 9, 12);

  it("devolve o e-mail de um token válido", () => {
    expect(readNewsletterToken(createNewsletterToken("ana@exemplo.com", now), now)).toBe("ana@exemplo.com");
  });

  it("aceita e-mail com | na parte local", () => {
    expect(readNewsletterToken(createNewsletterToken("a|b@exemplo.com", now), now)).toBe("a|b@exemplo.com");
  });

  it("recusa token com assinatura ou conteúdo alterado", () => {
    const [payload, signature] = createNewsletterToken("ana@exemplo.com", now).split(".");
    const otherPayload = Buffer.from(`eva@exemplo.com|${now + 3 * DAY}`).toString("base64url");
    expect(readNewsletterToken(`${payload}.${signature.slice(0, -1)}x`, now)).toBeNull();
    expect(readNewsletterToken(`${otherPayload}.${signature}`, now)).toBeNull();
    expect(readNewsletterToken("lixo", now)).toBeNull();
  });

  it("recusa token vencido (validade de 3 dias)", () => {
    const token = createNewsletterToken("ana@exemplo.com", now);
    expect(readNewsletterToken(token, now + 3 * DAY - 1)).toBe("ana@exemplo.com");
    expect(readNewsletterToken(token, now + 3 * DAY)).toBeNull();
  });
});

describe("subscribeToNewsletter", () => {
  let nextIp = 1;
  beforeEach(() => {
    ip = `203.0.113.${nextIp++}`;
    send.mockReset();
  });

  const subscribe = (email: string) => {
    const data = new FormData();
    data.set("email", email);
    return subscribeToNewsletter({ status: "idle" }, data);
  };

  it("manda o e-mail de confirmação com o link assinado", async () => {
    expect((await subscribe("bia@exemplo.com")).status).toBe("success");
    const link = /token=([\w.-]+)/.exec(send.mock.calls[0][0].text)?.[1] ?? "";
    expect(readNewsletterToken(link)).toBe("bia@exemplo.com");
  });

  it("não gasta as cotas do IP nem do e-mail quando o envio falha", async () => {
    // O limite por e-mail é de 2 por dia: sem a devolução, a 3ª tentativa nem enviaria.
    send.mockRejectedValue(new Error("Resend fora do ar"));
    for (let i = 0; i < 3; i++) expect((await subscribe("caio@exemplo.com")).status).toBe("error");

    send.mockReset();
    expect((await subscribe("caio@exemplo.com")).status).toBe("success");
    expect(send).toHaveBeenCalledOnce();
  });
});
