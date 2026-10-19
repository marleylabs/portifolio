import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "@/lib/frontmatter";

describe("parseFrontmatter", () => {
  it("separa o YAML do corpo", () => {
    expect(parseFrontmatter("---\ntitle: Olá\ntags: [css]\n---\n\nTexto.\n")).toEqual({
      data: { title: "Olá", tags: ["css"] },
      content: "\nTexto.\n",
    });
  });

  it("aceita quebras de linha do Windows (CRLF)", () => {
    expect(parseFrontmatter("---\r\ntitle: Olá\r\n---\r\nTexto.")).toEqual({ data: { title: "Olá" }, content: "Texto." });
  });

  it("mantém `---` no meio do corpo", () => {
    expect(parseFrontmatter("---\na: 1\n---\nAntes\n\n---\n\nDepois").content).toBe("Antes\n\n---\n\nDepois");
  });

  it("devolve data vazio sem frontmatter ou com frontmatter vazio", () => {
    expect(parseFrontmatter("# Só texto")).toEqual({ data: {}, content: "# Só texto" });
    expect(parseFrontmatter("---\n---\nTexto")).toEqual({ data: {}, content: "Texto" });
  });

  it("lê datas como texto, para o zod validar o calendário", () => {
    expect(parseFrontmatter("---\npublishedOn: 2026-13-45\n---\n").data).toEqual({ publishedOn: "2026-13-45" });
  });
});
