# Pendências registradas

Problemas encontrados durante as melhorias que ficaram para um lote específico.

## Lote 7 — erros que só aparecem no `next dev` (resolvido em 19/10/2026)

Os dois erros ("did not produce a static shell" e "params accessed outside of <Suspense>")
apareciam em `/[category]`, `/[category]/[slug]` e também em `/projetos/[slug]`. Resolvido com
`export const instant = false` nas três rotas: elas podem bloquear em vez de servir um App
Shell, e as páginas conhecidas continuam estáticas no build. `<Suspense>` foi descartado
porque um endereço inexistente passaria a responder 200 em vez de 404.

O `generateMetadata` das três rotas também chama `notFound()` (antes devolvia `{}`), senão
a aba da 404 mostrava o título da home, ou "Artigos sobre React" numa categoria sem artigos.

## Limitação conhecida — conteúdo da 404 nas rotas dinâmicas

Em `/pagina-perdida`, `/css/nao-existe` ou `/projetos/nao-existe`, o status é 404 e o
`noindex` está no HTML, mas o conteúdo da página 404 (e o `<title>`) é montado no navegador,
não vem no HTML do servidor. No `next dev` isso gera o aviso "Encountered a script tag while
rendering React component" (o script de preferências do `layout.tsx` re-renderizado no
cliente; ele já rodou no HTML do servidor, então tema e som continuam certos).
Quem navega sem JavaScript vê a página vazia. Corrigir exigiria checar o endereço no Proxy
antes da renderização; não vale a complexidade agora. Rever se o Next mudar esse comportamento.

## Lote 8 — vulnerabilidades aceitas (`npm audit`, 19/10/2026)

O `npm audit` mostra 5 altas, todas na cadeia `eslint-config-next` → `@next/eslint-plugin-next`
→ `fast-glob` → `micromatch` → `braces` (GHSA-vfj7-8cjw-p6xm: estouro de pilha com padrões de
glob muito aninhados).

- Só desenvolvimento: `npm audit --omit=dev` dá 0. Nada disso vai para o site.
- Exige padrões de glob escolhidos por um atacante; aqui eles vêm da nossa configuração.
- Sem correção publicada: `braces` 3.0.3 é a última versão, e até o canary do plugin do Next
  fixa `fast-glob` 3.3.1. **Não rodar `npm audit fix --force`**: ele volta o
  `eslint-config-next` para a 14, incompatível com o Next 16.
- Rever quando atualizar o Next: se o plugin trocar o `fast-glob`, os avisos somem.

As 4 moderadas do `gray-matter` (js-yaml 3 → argparse → sprintf-js) foram resolvidas
removendo a dependência: `src/lib/frontmatter.ts` faz o mesmo com o js-yaml 4.

Atenção ao mexer em dependências: use npm 11.21 ou mais novo (`npx npm@11.21.1 install …`).
O npm 11.9 apaga os campos `libc` do `package-lock.json`, que escolhem o binário certo do
`sharp` (glibc ou musl) na Vercel.
