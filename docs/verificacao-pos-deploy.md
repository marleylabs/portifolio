# Verificação pós-deploy

Itens que só dá para confirmar com o site na Vercel e os serviços reais (Resend, Upstash).
Os testes automáticos (`npm test`) cobrem a lógica com simulações; isto aqui confirma que
o mundo real se comporta como as simulações supõem.

Marque cada item depois do primeiro deploy de produção, e de novo depois de mudanças nas
áreas indicadas. `https://SEU-DOMINIO` é o valor de `NEXT_PUBLIC_SITE_URL`.

## Lote 1 — segurança e formulários

### Newsletter: reinscrição com a API real do Resend
Por quê: o código assume que o Resend responde "409 / already exists" a um contato
repetido. Os testes simulam essa resposta; não foi confirmada com a API real.

- [ ] Inscreva o seu próprio e-mail pelo rodapé e confirme pelo link recebido.
      No painel do Resend, o contato aparece com `unsubscribed: false` e, se
      `RESEND_SEGMENT_ID` estiver definido, dentro do segmento.
- [ ] Cancele a inscrição (pelo link de descadastro de um envio, ou marcando
      "unsubscribed" no painel do Resend).
- [ ] Inscreva-se de novo e confirme pelo novo link. A página deve mostrar "Pronto!" e,
      no painel, o contato deve voltar a `unsubscribed: false` e estar no segmento.
- [ ] Se o contato continuar desinscrito: veja nos logs da Vercel a linha
      `[newsletter] falha ao confirmar` e a mensagem do Resend; a detecção de conflito
      fica em `isConflict`, em `src/lib/email.ts`.

### CSP e cabeçalhos de segurança
- [ ] `curl -sI https://SEU-DOMINIO/` mostra `Content-Security-Policy` (não
      `-Report-Only`), `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` e
      `Permissions-Policy`. O `Strict-Transport-Security` vem da Vercel.
- [ ] Com o DevTools aberto (aba Console), navegue por: home (trocar tema, ligar/desligar
      som, buscar), `/projetos` (filtrar), um artigo com playground (rolar até ele, editar
      o código, ver o preview), um estudo de caso, `/contato` e uma página 404.
      Não deve aparecer nenhum "Refused to…" nem "violates the following Content Security
      Policy directive".
      Esperado e aceito: avisos "Potential permissions policy violation" quando o
      playground abre (o iframe do Sandpack pede câmera, microfone etc. e a política nega).
- [ ] Se a Vercel Analytics ou o Speed Insights forem ligados depois, refaça este item:
      eles precisam de entradas novas em `script-src`/`connect-src` (`next.config.ts`).
- [ ] Depois de atualizar o `@codesandbox/sandpack-react`, abra um playground: se o
      preview ficar em branco, o bundler mudou de domínio e o `frame-src` precisa de ajuste.

### IP do visitante e limites
- [ ] O `x-forwarded-for` chega: curta um artigo. Se a curtida for registrada (o contador
      sobe e continua depois de recarregar), o IP chegou — sem ele, a API responde 400.
- [ ] Limite de curtidas: curta o mesmo artigo 10 vezes; a 11ª não conta. Pelo celular no
      4G (outro IP), o contador "seu" começa do zero.
- [ ] Limite do contato: envie 3 mensagens em menos de uma hora; a 4ª mostra
      "Você já enviou várias mensagens…". (As 3 chegam no `CONTACT_TO_EMAIL`.)
- [ ] Limite da newsletter por e-mail: peça a inscrição do mesmo e-mail 3 vezes no mesmo
      dia; só chegam 2 e-mails de confirmação (a 3ª mostra sucesso, mas não envia).
- [ ] Pedido de outro site é recusado:
      `curl -s -o /dev/null -w "%{http_code}\n" -X POST https://SEU-DOMINIO/api/likes -H "content-type: application/json" -H "sec-fetch-site: cross-site" -d '{"id":"article:css/molas-em-css","count":1}'`
      deve imprimir `403`.
- [ ] No painel do Upstash, as chaves `ratelimit:*` somem sozinhas depois da janela (têm TTL).

## Lote 2 — acessibilidade

### Leitor de tela de verdade
Por quê: localmente foi conferida a árvore de acessibilidade (o botão expõe "pressionado"
e a região de aviso recebe o texto), não a fala de um leitor de tela.

- [ ] **VoiceOver (iPhone ou Mac)** ou **TalkBack (Android)** ou **NVDA (Windows)**:
      foque o botão "Pausar animações" e ative-o. O leitor deve dizer o nome e o estado
      ("Pausar animações, botão de alternância, selecionado/pressionado"); ao ativar de
      novo, "não selecionado/não pressionado". No celular, o botão fica no menu (☰),
      linha "Animações".
- [ ] Em `/contato`, escreva uma letra no Nome e passe para o próximo campo: o leitor deve
      ler "Nome: …" com o erro, sem precisar voltar ao campo.
- [ ] Num bloco de código, com o clipboard bloqueado (Safari às vezes bloqueia), "Copiar"
      deve avisar "Não foi possível copiar…".

### Pausa das animações
- [ ] Pause pelo header, recarregue a página: tudo continua parado desde o primeiro
      quadro (sem as ondas "andarem" um instante antes de parar).
- [ ] Num aparelho com "Reduzir movimento" ligado no sistema (iOS: Ajustes → Acessibilidade
      → Movimento; Android: Remover animações; macOS/Windows: nas opções de acessibilidade),
      o botão aparece pausado (▶) e não muda ao tocar. No desktop, ao passar o mouse ou
      focar, aparece "Animações reduzidas pelas configurações do seu sistema"; no menu do
      celular, essa frase fica escrita abaixo de "Animações". O leitor de tela lê o botão
      como pressionado e indisponível, com a frase como descrição.
