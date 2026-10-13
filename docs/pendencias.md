# Pendências registradas

Problemas encontrados durante as melhorias que ficaram para um lote específico.

## Lote 7 — erros que só aparecem no `next dev`

Encontrados em 12/10/2026 durante o Lote 5b. Existem também sem nenhuma mudança do 5b
(testado removendo o seletor de direções): são anteriores. O build de produção passa e
não é afetado; no `next dev`, o indicador do Next mostra "2 issues".

1. **A rota `/[category]` captura endereços inexistentes (ex.: `/pagina-perdida`).**
   No dev: `InvariantError: Route "/[category]" did not produce a static shell and Next.js
   was unable to determine a reason`, seguido de "Encountered a script tag while rendering
   React component" (o script inline de preferências do `layout.tsx`, re-renderizado no
   cliente durante a recuperação do erro).
   Investigar: `notFound()` para categorias que não existem em `src/app/[category]/page.tsx`
   (e `generateStaticParams` com `dynamicParams = false`, se a versão do Next pedir), para a
   404 sair da rota dinâmica.

2. **`params` lidos fora de `<Suspense>` em `/[category]/[slug]`.**
   No dev: `Route "/[category]/[slug]": Next.js encountered URL data during prerendering or a
   navigation. params or searchParams accessed outside of <Suspense> may prevent the
   navigation from being instant`.
   Investigar na documentação local do Next 16 (`node_modules/next/dist/docs/`): envolver o
   trecho que lê `params` em `<Suspense>` ou marcar a rota conforme a opção indicada na
   mensagem (`instant`), sem perder a página estática.
