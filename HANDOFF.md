# Passagem de contexto para o Claude Code (outro notebook)

> Para o Claude: leia este arquivo inteiro antes de qualquer coisa. Ele substitui a memória
> local da máquina anterior, que não vai junto com o repositório. Depois de ler, salve os
> pontos relevantes na sua memória e pergunte ao usuário por onde continuar.

Atualizado em 19/10/2026.

## Preparar o ambiente

```bash
git clone https://github.com/marleylabs/portifolio.git
cd portifolio
git checkout melhorias/auditoria
git config user.name "Marley"
git config user.email "andersonmarleylima@icloud.com"   # identidade escolhida pelo usuário
npm install
npm run dev
```

- Node usado: v24.14.1. Next.js 16 — leia `AGENTS.md` e a documentação local em
  `node_modules/next/dist/docs/` antes de escrever código (APIs diferem do que você conhece).
- Variáveis de ambiente: copie `.env.example` para `.env.local` e preencha. Nenhum segredo está
  no repositório. Sem Upstash/`VISITOR_SALT`, contato e newsletter ficam indisponíveis de propósito;
  para testes locais existe `LIKES_STORE=memory`.
- Scripts: `npm run dev | build | lint | test | check:contrast`.

## Quem é o usuário e o que é o projeto

Anderson Marley, dev fullstack. Portfólio/blog pessoal inspirado na *experiência* de
joshwcomeau.com, com identidade própria: nunca copiar ilustrações, mascote, textos ou marca do Josh.

Princípios: whimsy com propósito e física de mola; leitura confortável (~65ch); dark mode de
primeira classe sem flash; sons sutis opcionais com botão de desligar; acessibilidade (movimento
reduzido, foco visível, contraste AA, HTML semântico); performance (Lighthouse 95+, pouco JS no
cliente). Preferir animação só em CSS para UI sempre presente.

Entrega: explicar decisões em poucas palavras, código completo (sem "// resto do código"),
conteúdo e textos da interface em português (pt-BR).

## Como trabalhar (regras do usuário)

- Trabalhar em lotes aprovados: diagnóstico → auditoria → plano → implementação. Não editar
  arquivos antes de o plano ser aprovado; um lote por vez, mostrar o resultado e esperar aprovação.
- Rodar `ponytail-review` nas mudanças ao fim de cada lote de implementação, antes de apresentar.
- Nunca alterar informações pessoais, projetos ou experiências sem perguntar.
- Um commit por lote na branch `melhorias/auditoria`. Push só quando o usuário pedir.
- Manter `docs/verificacao-pos-deploy.md` atualizado com tudo que só dá para checar em produção.

## Estado do plano de melhorias

| Lote | Situação |
|------|----------|
| 0–2 | Concluídos |
| 3 — Performance | Concluído (4a19f73): Motion removido; filtro de /projetos com `<ViewTransition>` + `--ease-spring`; perf 96/96/97, JS gzip −23,7% /projetos e −23,5% no artigo. Medições em `.lighthouse/` |
| 4 — Responsividade e tokens | Concluído (4a522e7): header com breakpoint próprio de 56rem, geral 45rem, logo com reticências ~320px (nunca abreviar o nome) |
| 5 — Visual | Concluído (027b366, 564ea36, 853b1e3): direção "Cósmica" como tokens padrão, mascote orbital, sistema solar no hero, olhos que seguem, planeta fugido na 404, áreas nos projetos + filtro `?area=` |
| 6 — Textos | Concluído: nova copy (hero com prova "15 planilhas… 50 → 4 minutos", `src/lib/site.ts`, estudo de caso, artigo, formulários) e novo `cover.png`. Revisado com ponytail-review e aprovado em 19/10/2026 |
| 7 — Erros do `next dev` | Concluído em 19/10/2026: `instant = false` em `/[category]`, `/[category]/[slug]` e `/projetos/[slug]`; `generateMetadata` chama `notFound()`. A lista original de outros itens do Lote 7 se perdeu na troca de máquina; o usuário decidiu seguir sem eles. Limitação registrada em `docs/pendencias.md` |
| 8 — Dependências (`npm audit`) | Concluído em 19/10/2026: `gray-matter` removido (função própria em `src/lib/frontmatter.ts`, com teste); 5 altas da cadeia do ESLint aceitas e registradas em `docs/pendencias.md`. `npm audit --omit=dev` = 0 |

Decisões registradas:
- Item 21: contador de visualizações removido, seção renomeada para "Destaques".
- CSP aplicada de verdade (não Report-Only).
- Item 18: confirmar que a Vercel sempre envia `x-forwarded-for` antes de rejeitar requisições sem IP.
- Avisos de Permissions-Policy do Sandpack no console: aceitos, manter.
- Planetas do sistema solar (Next.js, Node.js, PostgreSQL, IA, Vercel): confirmados pelo usuário em 19/10/2026.
- `este-portfolio.mdx` não deve citar "Motion" na stack (confirmado; já não cita).
- Copy: T2 só em texto corrido, não em código; T9 é o número medido após o Lote 3.

Plano de melhorias concluído (Lotes 0–8). Próximos passos possíveis: deploy na Vercel e roteiro de `docs/verificacao-pos-deploy.md`. Para mexer em dependências, use npm ≥ 11.21 (ver `docs/pendencias.md`).
