import { beforeEach, describe, expect, it, vi } from "vitest";

const contacts = {
  create: vi.fn(),
  update: vi.fn(),
  segments: { add: vi.fn() },
};
vi.mock("resend", () => ({
  Resend: class {
    contacts = contacts;
  },
}));

const ok = { data: { id: "c1" }, error: null };
const conflict = { data: null, error: { message: "Contact already exists", statusCode: 409, name: "validation_error" } };

async function confirm(email: string) {
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("RESEND_SEGMENT_ID", "seg_1");
  vi.resetModules(); // o cliente do Resend é criado uma vez por módulo
  const { addNewsletterContact } = await import("@/lib/email");
  return addNewsletterContact(email);
}

beforeEach(() => {
  vi.unstubAllEnvs();
  for (const fn of [contacts.create, contacts.update, contacts.segments.add]) fn.mockReset().mockResolvedValue(ok);
});

describe("addNewsletterContact", () => {
  it("cria o contato novo já no segmento", async () => {
    await confirm("ana@exemplo.com");
    expect(contacts.create).toHaveBeenCalledWith({
      email: "ana@exemplo.com",
      unsubscribed: false,
      segments: [{ id: "seg_1" }],
    });
    expect(contacts.update).not.toHaveBeenCalled();
  });

  it("reativa quem já era contato (ex.: tinha cancelado) e o põe no segmento", async () => {
    contacts.create.mockResolvedValue(conflict);
    await confirm("ana@exemplo.com");
    expect(contacts.update).toHaveBeenCalledWith({ email: "ana@exemplo.com", unsubscribed: false });
    expect(contacts.segments.add).toHaveBeenCalledWith({ email: "ana@exemplo.com", segmentId: "seg_1" });
  });

  it("aceita quem já está no segmento", async () => {
    contacts.create.mockResolvedValue(conflict);
    contacts.segments.add.mockResolvedValue(conflict);
    await expect(confirm("ana@exemplo.com")).resolves.toBeUndefined();
  });

  it("propaga outros erros do Resend", async () => {
    contacts.create.mockResolvedValue({ data: null, error: { message: "Invalid API key", statusCode: 401 } });
    await expect(confirm("ana@exemplo.com")).rejects.toThrow("Invalid API key");
  });
});
