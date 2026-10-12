# Anderson Marley — Portfólio

Portfólio e blog pessoal. Next.js 16 (App Router, Cache Components), TypeScript, MDX, CSS Modules.

## Rodando

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # build de produção (falha se alguma página deixar de ser estática)
```

Em produção, defina `NEXT_PUBLIC_SITE_URL` (ex.: `https://andersonmarley.dev`) na Vercel: ela é usada em
canonical, Open Graph, sitemap e RSS.

## Conteúdo

Dois tipos, ambos em MDX (o nome do arquivo não importa; vale o `slug`):

| Tipo | Pasta | URL |
| --- | --- | --- |
| Artigo | `content/articles/` | `/[category]/[slug]` (ex.: `/css/molas-em-css`) |
| Projeto | `content/projects/` | `/projetos/[slug]` |

Frontmatter comum (validado com zod em `src/lib/content.ts`; o build falha com mensagem apontando arquivo e campo):

```yaml
title: Molas em CSS puro com linear()
slug: molas-em-css                 # minúsculas, números e hífens
category: css                      # artigos: ver ARTICLE_CATEGORIES em src/lib/categories.ts
summary: Duas a quatro frases. Tom amigável.
publishedOn: 2026-10-08
updatedOn: 2026-10-20              # opcional, não pode ser anterior a publishedOn
tags: [css, animação]
cover: { src: /capas/molas.png, alt: Descrição da imagem }   # opcional
externalUrl: https://dev.to/...    # opcional: sem página interna, o card abre o link em nova aba
draft: true                        # opcional: aparece no dev, some em produção
```

Projetos têm ainda: `cover` **obrigatória** (o build confere se o arquivo existe em `/public`), `stack[]`,
`featured` (a home mostra os 3 mais recentes marcados), `role` (opcional) e `links: { demo, github }` (opcional).
Suas categorias ficam em `PROJECT_CATEGORIES`. A data do projeto é o `publishedOn`, como nos artigos.

### Estudos de caso

O corpo de um projeto precisa ter estas seções `##`, nesta ordem (o build falha se faltar alguma):
**Problema → Solução → Arquitetura → Desafios → Resultado**. Elas ganham numeração e entram no sumário lateral.

Recursos disponíveis no MDX:

```mdx
![Descrição da imagem](/projects/meu-projeto/tela.png "Legenda opcional")

<Diagram
  title="Nome do diagrama"
  columns={[[{ id: "app", label: "App", note: "Next.js" }], [{ id: "db", label: "Banco" }]]}
  edges={[["app", "db", "consulta"]]}
  caption="Legenda opcional"
/>

<BuiltWithAI tools={["Claude Code", "Cursor"]}>

Seção opcional "Como eu construí com IA", em Markdown.

</BuiltWithAI>
```

Imagens precisam estar em `/public` e ter texto alternativo; as dimensões são lidas do arquivo no build.
O `<Diagram>` é desenhado em SVG no servidor (zero JS) e gera a descrição acessível a partir das conexões.
Rascunhos (`draft: true`) também aparecem num build com `SHOW_DRAFTS=true` (útil em previews).

Funções da camada de dados: `getAllArticles`, `getArticlesByCategory`, `getArticle`, `getArticleCategories`,
`getAllProjects`, `getProject` e `getPopular` — todas em ordem de data decrescente. `getPopular` escolhe os
artigos pelo contador de visualizações (`src/lib/views.ts`, a implementar) e, sem dados, pela lista manual em
`src/lib/popular.ts`.

### Componentes de MDX (artigos e projetos)

````mdx
```ts title="soma.ts" {2,4-5}          // nome do arquivo + linhas destacadas
const x = 1; // [!code highlight]       // destaque na própria linha (também [!code ++] / [!code --])
```

<CodeBlock lang="ts" filename="soma.ts" highlight="2" code={`...`} />   // mesma coisa, em JSX

<Sidenote type="info|warning|success">Texto em Markdown.</Sidenote>

Uma frase com nota de rodapé<Asterisk>O texto da nota.</Asterisk>.

<Playground title="Demo" dir="minha-demo" activeFile="/styles.css" template="static" />

<Spacer size="sm|md|lg|xl" />   // ou size={40} (px)
````

- `<Playground>` lê os arquivos de `content/playgrounds/<dir>/` (template `static`, `vanilla` ou `react`).
  O editor (Sandpack) só é baixado quando o leitor chega perto; antes disso aparece o código realçado.
  A prévia roda num iframe do bundler da CodeSandbox. Também aceita `files={{ "/index.html": \`...\` }}`,
  mas o MDX remove a indentação das linhas: prefira `dir`.
- `<Asterisk>` usa a Popover API nativa (abre/fecha sem JS) e anchor positioning onde houver suporte.
- Notas de rodapé no estilo GFM (`[^1]`) também funcionam.

A busca (Ctrl/⌘ K ou `/`) usa `/search-index.json`, gerado no build a partir do frontmatter.

Componentes disponíveis no MDX: `<Callout type="info|warning|success">`.

## Avatar do hero

Coloque os PNGs em `public/avatar/` e rode o build de novo:

| Arquivo | |
| --- | --- |
| `avatar-light.png` | tema claro (se só existir um dos dois, ele vale para ambos) |
| `avatar-dark.png` | tema escuro |
| `avatar-blink-light.png` / `avatar-blink-dark.png` | opcionais: o mesmo desenho de olhos fechados, usado na piscada |

Use imagens quadradas com fundo transparente (≥ 640×640). Sem nenhum PNG, aparece o mascote SVG provisório.
Os textos do hero ficam em `src/lib/site.ts` (`hero`).

## Curtidas

Botão no fim de cada artigo e estudo de caso (até 10 curtidas por visitante), salvo no **Upstash Redis**
via `/api/likes`. Configure na Vercel (ou em `.env.local`; veja `.env.example`):

| Variável | |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | do painel da Upstash (a integração Upstash da Vercel cria `KV_REST_API_URL`/`KV_REST_API_TOKEN`, também aceitos) |
| `VISITOR_SALT` | texto aleatório e secreto (`openssl rand -hex 32`); o visitante é identificado por `sha256(salt + IP)` — o IP nunca é gravado |

- Em `npm run dev`, sem essas variáveis, as curtidas ficam em memória (somem ao reiniciar).
- Em produção sem configuração, a API responde 503 e o botão aparece como indisponível.
- O limite de 10 é aplicado de forma atômica num script Lua no Redis; há também um limite de 30 requisições/minuto por visitante.
- Teste local com Redis de verdade: suba `redis` + `hiett/serverless-redis-http` (emulador da API REST da Upstash) e aponte `UPSTASH_REDIS_REST_URL` para ele.

## Contato e newsletter (Resend)

Configure `RESEND_API_KEY`, `RESEND_FROM` (domínio verificado), `CONTACT_TO_EMAIL`, `NEWSLETTER_SECRET`
e, opcionalmente, `RESEND_SEGMENT_ID` (veja `.env.example`). Em `npm run dev` sem chave, os e-mails aparecem
no terminal em vez de serem enviados.

- **Contato** (`/contato`): validação com o mesmo schema zod no navegador e no servidor; o e-mail chega a
  `CONTACT_TO_EMAIL` com "Responder para" de quem escreveu. Limite: 3 mensagens/hora por visitante.
- **Newsletter** (rodapé): double opt-in. O inscrito recebe um link assinado (HMAC, válido por 3 dias) e só
  entra nos contatos do Resend ao clicar em "Confirmar" em `/newsletter/confirmar`. Limites: 5 tentativas/hora
  por visitante e 2 e-mails de confirmação/dia por endereço.
- **Anti-spam** (os dois): honeypot, tempo mínimo de preenchimento (2s) e rate limit por hash do IP.
- Os dois formulários funcionam com o JavaScript desligado (Server Actions).

## Página Sobre

Tudo em `content/pages/sobre.mdx`: o texto no corpo; foto, linha do tempo e stack no frontmatter (validado).
Itens com `example: true` aparecem com um selo "exemplo" — troque pelos seus dados e remova a flag.
Para a foto, coloque o arquivo em `public/` e preencha `photo: { src, alt }`.

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run check:contrast` | Verifica contraste WCAG AA dos tokens de cor nos dois temas |
| `npm run spring-curve -- 300 20 1` | Gera a curva `linear()` de mola (stiffness, damping, mass) |
| `npm run generate:sounds` | Re-sintetiza `public/sounds/sprite.wav` e o mapa do sprite |
| `npm run typecheck` | Gera os tipos de rota do Next e roda o `tsc` |

## Decisões

- **Tema sem flash**: script inline no `<head>` lê o `localStorage` (fallback: `prefers-color-scheme`) e define `data-theme` antes da primeira pintura. Não usamos cookie porque lê-lo no servidor tornaria todas as páginas dinâmicas.
- **Cores**: cada token é declarado uma vez com `light-dark(claro, escuro)`; o `color-scheme` (vindo de `data-theme`) escolhe a variante. `theme-color` é derivado de `--color-bg` em runtime.
- **Troca de tema**: a classe temporária `.theme-transition` transiciona só propriedades de cor (`--transition-colors`) por ~350ms; componentes com `transition` própria incluem esse token.
- **Molas**: transições em CSS usam `--ease-spring`. O Motion só é usado onde há springs interrompíveis/AnimatePresence, e só nessas páginas.
- **Sons**: um único sprite carregado sob demanda via `use-sound`; o botão no header desliga tudo (preferência salva).
- **Header**: sticky (IntersectionObserver numa sentinela), logo com letras pulando (Web Animations API + mola de `lib/spring`), pílula de hover calculada por posição, drawer mobile e busca em `<dialog>` nativo (trap de foco, Esc, `@starting-style`). O scroll trava via `:root:has(dialog[open])`.
- **Vidro fosco**: o `backdrop-filter` fica num filho do header com 200% da altura e `mask-image` na metade de baixo — o blur considera o que está logo abaixo da borda. `pointer-events: none` mantém o conteúdo clicável.
- **Header blocker** (`components/HeaderBlocker`): retângulo sticky da cor do fundo, primeiro filho de colunas com conteúdo sticky (ex.: o sumário). O sumário passa por baixo dele, em vez de aparecer atrás do vidro. Complementarmente, `main { isolation: isolate }` impede que `z-index` do conteúdo suba por cima do header.
- **Molas sem lib**: `lib/spring.ts` simula a física (stiffness/damping/mass) e gera uma easing `linear()`. Usada pelo token `--ease-spring`, pelo `useBoop` e pelo logo.
- **useBoop / usePrefersReducedMotion** (`src/hooks`): `const [style, trigger] = useBoop({ rotation, scale, x, y, timing, springConfig })`. Toda animação disparada por JS consulta `usePrefersReducedMotion` (que assume `true` no servidor); o CSS global zera transições com a mesma preferência.
