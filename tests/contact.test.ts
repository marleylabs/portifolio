import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendContactMessage } from "@/app/actions/contact";
import { EmailRejectedError, sendEmail } from "@/lib/email";

let ip = "";
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": ip }) }));
vi.mock("@/lib/email", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/email")>()),
  sendEmail: vi.fn(),
}));

const send = vi.mocked(sendEmail);

function form(fields: Record<string, string> = {}) {
  const data = new FormData();
  const values = {
    name: "Ana",
    email: "ana@exemplo.com",
    topic: "projeto",
    message: "Olá! Quero conversar sobre um projeto novo.",
    ...fields,
  };
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

const submit = (fields?: Record<string, string>) => sendContactMessage({ status: "idle" }, form(fields));

let nextIp = 1;
beforeEach(() => {
  ip = `192.0.2.${nextIp++}`;
  send.mockReset();
});

describe("sendContactMessage", () => {
  it("envia uma mensagem válida", async () => {
    expect((await submit()).status).toBe("success");
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0][0]).toMatchObject({ replyTo: "ana@exemplo.com" });
  });

  it("devolve os erros por campo sem enviar", async () => {
    const state = await submit({ email: "ana", message: "curta" });
    expect(state.status).toBe("error");
    expect(Object.keys(state.errors ?? {})).toEqual(["email", "message"]);
    expect(send).not.toHaveBeenCalled();
  });

  it("finge sucesso para robôs (honeypot) sem enviar", async () => {
    expect((await submit({ website: "http://spam.example" })).status).toBe("success");
    expect(send).not.toHaveBeenCalled();
  });

  it("escapa HTML no corpo do e-mail", async () => {
    await submit({ message: "<script>alert(1)</script> mensagem longa o bastante" });
    expect(send.mock.calls[0][0].html).toContain("&lt;script&gt;");
  });

  it("bloqueia a quarta mensagem na mesma hora", async () => {
    for (let i = 0; i < 3; i++) expect((await submit()).status).toBe("success");
    expect((await submit()).status).toBe("error");
    expect(send).toHaveBeenCalledTimes(3);
  });

  it("não gasta a cota quando o envio falha", async () => {
    send.mockRejectedValue(new Error("Resend fora do ar"));
    for (let i = 0; i < 3; i++) expect((await submit()).status).toBe("error");

    send.mockReset();
    expect((await submit()).status).toBe("success");
    expect(send).toHaveBeenCalledOnce();
  });

  it("gasta a cota quando o Resend recusa o pedido (repetir não adianta)", async () => {
    send.mockRejectedValue(new EmailRejectedError("Resend: invalid reply_to"));
    for (let i = 0; i < 3; i++) await submit();

    send.mockReset();
    expect((await submit()).status).toBe("error");
    expect(send).not.toHaveBeenCalled();
  });
});
