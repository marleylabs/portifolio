import { vi } from "vitest";

// "server-only" quebra qualquer import fora do servidor do Next; nos testes, é inofensivo.
vi.mock("server-only", () => ({}));
