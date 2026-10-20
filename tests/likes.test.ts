import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/likes/route";
import { clientIp } from "@/lib/visitor";

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: async () => {},
}));

vi.mock("@/lib/content", () => ({
  getAllArticles: async () => [{ id: "css/molas-em-css", isExternal: false }],
  getAllProjects: async () => [],
}));

const ID = "article:css/molas-em-css";
const SITE = "http://localhost:3000";

// Cada teste usa IPs próprios: o armazenamento em memória é compartilhado entre eles.
function post(body: unknown, ip: string, headers: Record<string, string> = {}) {
  return POST(
    new NextRequest(`${SITE}/api/likes`, {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: SITE,
        "sec-fetch-site": "same-origin",
        "content-type": "application/json",
        "x-forwarded-for": ip,
        ...headers,
      },
      body: JSON.stringify(body),
    }),
  );
}

function get(ip: string | null) {
  return GET(
    new NextRequest(`${SITE}/api/likes?id=${encodeURIComponent(ID)}`, {
      headers: ip ? { "x-forwarded-for": ip } : {},
    }),
  );
}

afterEach(() => vi.unstubAllEnvs());

describe("POST /api/likes", () => {
  it("aceita um pedido do próprio site", async () => {
    const response = await post({ id: ID, count: 2 }, "198.51.100.1");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ total: expect.any(Number), mine: 2 });
  });

  it("recusa Content-Type que só contém application/json", async () => {
    const response = await post({ id: ID, count: 1 }, "198.51.100.2", {
      "content-type": "text/plain; x=application/json",
    });
    expect(response.status).toBe(415);
  });

  it("recusa pedidos vindos de outro site", async () => {
    expect((await post({ id: ID, count: 1 }, "198.51.100.3", { "sec-fetch-site": "cross-site" })).status).toBe(403);
    expect((await post({ id: ID, count: 1 }, "198.51.100.3", { origin: "https://outro.example" })).status).toBe(403);
  });

  it("recusa conteúdo que não existe", async () => {
    expect((await post({ id: "article:nao/existe", count: 1 }, "198.51.100.4")).status).toBe(404);
  });

  it("não passa de 10 curtidas por visitante", async () => {
    await post({ id: ID, count: 10 }, "198.51.100.5");
    const response = await post({ id: ID, count: 3 }, "198.51.100.5");
    expect((await response.json()).mine).toBe(10);
  });

  it("conta um bloco IPv6 /64 como um visitante só", async () => {
    await post({ id: ID, count: 10 }, "2001:db8:aa:1::1");
    expect((await (await get("2001:db8:aa:1:ffff:ffff:ffff:9")).json()).mine).toBe(10);
    expect((await (await get("2001:db8:aa:2::1")).json()).mine).toBe(0);
  });

  it("recusa pedido sem IP em produção", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await get(null)).status).toBe(400);
  });
});

describe("clientIp", () => {
  const ip = (value: string) => clientIp(new Headers({ "x-forwarded-for": value }));

  it("usa o primeiro IP da lista", () => expect(ip("203.0.113.7, 10.0.0.1")).toBe("203.0.113.7"));
  it("trata IPv4 escrito como IPv6 como IPv4", () => expect(ip("::ffff:203.0.113.7")).toBe("203.0.113.7"));
  it("reduz IPv6 ao prefixo /64", () => {
    expect(ip("2001:db8:aa:1::1")).toBe("2001:db8:aa:1::/64");
    expect(ip("2001:0db8:00aa:0001:1:2:3:4")).toBe("2001:db8:aa:1::/64");
    expect(ip("2001:db8::1")).toBe("2001:db8:0:0::/64");
  });
});
