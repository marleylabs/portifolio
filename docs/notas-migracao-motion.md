# Notas: saída do Motion e migração para View Transitions

Material de apoio para escrever sobre a troca no estudo de caso. Não é publicado no site.
Medições feitas em 12/10/2026, na mesma máquina, com o build de produção servido
localmente (`next start`).

## Onde o Motion era usado

| Lugar | Para quê | O que entrou no lugar |
|---|---|---|
| Botão "Copiar" dos blocos de código (todo artigo e estudo de caso) | Trocar o ícone de copiar pelo ✓ com uma mola | Os dois ícones no DOM; a troca é uma transição CSS com a mola do site (`--ease-spring`) |
| Filtro de `/projetos` | Layout animations: cards deslizando para a nova posição, entrando e saindo | `<ViewTransition>` do React, que usa a View Transitions API nativa do navegador, com a mesma mola |

O Motion entrava inteiro (núcleo + features de layout) nas páginas que o usavam. A home
também baixava o JS de `/projetos` por pré-carregamento dos links.

## Quanto pesava

Composição do JS inicial estimada pelo analisador do Next (antes das mudanças):

| | Home | /projetos | Artigo |
|---|---|---|---|
| Next.js (runtime, roteador) | 141 KB · 56% | 141 KB · 44% | 141 KB · 44% |
| React | 76 KB · 30% | 76 KB · 24% | 76 KB · 24% |
| **Motion** | — | **66 KB · 21%** | **66 KB · 20%** |
| Código do site | 18 KB · 7% | 17 KB · 5% | 21 KB · 6% |

Na home, o pré-carregamento de `/projetos` somava mais ~54 KB gzip de Motion depois do load.

## Antes × depois

JS inicial por rota (gzip, somando os scripts que cada página carrega):

| Rota | Linha de base | Sem Motion no artigo | Sem Motion em lugar nenhum |
|---|---|---|---|
| `/` | 208,4 KB | 192,8 KB | 192,9 KB (−7,4%) |
| `/projetos` | 253,0 KB | 238,4 KB | **193,0 KB (−23,7%)** |
| `/css/molas-em-css` | 255,6 KB | 195,5 KB | **195,6 KB (−23,5%)** |

(Parte da queda da home e de todas as páginas vem também de tirar o zod do rodapé.)

Lighthouse mobile, mediana de 3 execuções:

| Página | Performance | LCP | TBT | JS transferido |
|---|---|---|---|---|
| Home | 94 → 96 → **96** | 2,43 → 2,33 → 2,54 s | 256 → 164 → 135 ms | 227 → 221 → **173 KB** |
| /projetos | 88 → 93 → **96** | 3,48 → 2,95 → **2,61 s** | 199 → 162 → 71 ms | 238 → 234 → **185 KB** |
| Artigo | 91 → 95 → **97** | 2,87 → 2,57 → 2,56 s | 237 → 169 → 75 ms | 230 → 177 → 177 KB |

Colunas: linha de base → Lote 3 ainda com Motion em `/projetos` → sem Motion.
O TBT varia bastante entre rodadas (o do artigo caiu sem o código dele mudar); os números
seguros são os de JS e de Performance.

## A animação: comparação de tempos

Medido dentro da página, sem gravação de vídeo, 5 cliques no filtro em cada versão:

| | Começa a se mexer | Assenta visualmente | Fim técnico |
|---|---|---|---|
| Motion (spring 350/30) | +6 a +19 ms | ~550 ms | ~550 ms |
| Nativo (mola do site, 300/20, 800 ms) | +49 a +126 ms | ~430 ms | ~900 ms |

- O atraso inicial da versão nativa (~50–100 ms) é o navegador fotografando a tela antes
  de animar. É inerente à API e quase imperceptível.
- A mola do site tem cauda longa: a partir de ~370 ms ela já está a menos de 1% do lugar
  final; o resto até 800 ms é invisível. Por isso "assenta" antes do Motion, apesar de o
  fim técnico ser mais tarde.
- Comparação em vídeo, lado a lado, em `capturas/lote-3-filtro/comparacao.html`.

## Por que View Transitions (e não as outras opções)

Opções consideradas para tirar o Motion do carregamento de `/projetos`:

- **A. Carregar o Motion só no primeiro uso do filtro.** Mantinha a biblioteca, mas
  trocar o grid estático pelo animado remontaria os cards uma vez (as capas podiam piscar).
- **B. View Transitions nativas** — escolhida.
- **C. Aceitar como estava** (Performance 93 em /projetos, −5,8% de JS).

Motivos da escolha:

- Remove a dependência inteira, não só de uma página; a home deixa de pré-carregar ~54 KB.
- Zero JS de animação: quem anima é o navegador, fora da thread principal.
- Mantém a sensação física com a mesma mola `linear()` do resto do site.
- Combina com as transições entre páginas planejadas para depois.
- Degrada bem: navegador sem suporte troca o grid na hora, sem erro.

## Detalhes de implementação que valem contar

- Os cards só animam em transições do tipo `filtro-projetos` (`addTransitionType`);
  navegar para outra página, que no Next também é uma transição, não dispara nada neles.
- Com o botão "Pausar animações" ou "reduzir movimento" no sistema, a troca acontece fora
  de uma transição: o grid muda na hora.
- Card que só muda de lugar: o "retrato antigo" fica invisível para não haver fantasma
  cruzando a tela; os que entram crescem de 92% com a mola, os que saem encolhem.
- Suporte: Chrome/Edge 125+, Safari 18.2+, Firefox 144+.
