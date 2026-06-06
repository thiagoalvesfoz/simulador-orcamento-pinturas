# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Visão geral

MVP de geração de orçamentos de pintura via IA. O usuário descreve um serviço por texto ou voz, o sistema extrai dados estruturados, calcula uma faixa de preço, permite revisão manual e gera um PDF para download. Sem banco de dados — todo o estado de sessão vive em `sessionStorage` no navegador.

Os requisitos completos estão em `docs/documento_requisitos_orcamento_pintura_mvp.pdf`. Termos de domínio (tipos de serviço, complexidades, fatores) estão definidos como `as const` em `src/lib/types.ts` — esse arquivo é a fonte da verdade; sempre adicione novos termos lá primeiro.

## Comandos

Este projeto usa **pnpm** (fixado via `packageManager` no `package.json`). Não use `npm install` — vai gerar `package-lock.json` e bagunçar o lockfile do pnpm.

```bash
pnpm install      # instalar dependências
pnpm dev          # dev server (Turbopack, http://localhost:3000)
pnpm build        # build de produção
pnpm start        # serve o build
pnpm lint         # ESLint (next lint foi removido na v16)
pnpm exec tsc --noEmit  # type-check sem emitir arquivos
```

Para usar a extração via IA, copie `.env.example` para `.env.local` e preencha **uma** das chaves:
- `GEMINI_API_KEY` (gratuito, recomendado — obter em https://aistudio.google.com/)
- `OPENAI_API_KEY` (pago)

Forçar provedor com `AI_PROVIDER=gemini|openai`. Sem nenhuma chave, o sistema cai automaticamente na extração heurística — não quebra.

**Build scripts aprovados** (`pnpm.onlyBuiltDependencies` no `package.json`): `sharp` (otimização de imagens do Next) e `unrs-resolver` (resolver do ESLint). Ao adicionar deps que precisam de scripts pós-instalação, aprove explicitamente — pnpm bloqueia por padrão.

## Arquitetura

**Stack:** Next.js 16 (App Router, Turbopack, React 19.2), TypeScript, Tailwind 4, `@react-pdf/renderer`, `@google/genai` (Gemini) / `openai` (alternativa).

**Fluxo de uma ponta a outra:**

1. `src/app/page.tsx` — usuário digita ou dita a descrição (componente `VozRecorder` usa Web Speech API). POST para `/api/analisar`.
2. `src/app/api/analisar/route.ts` — tenta `extrairComIA` (Gemini ou OpenAI conforme chave disponível); em qualquer falha cai em `extrairHeuristico`. Em seguida chama `calcularFaixaPreco`. Devolve um `DadosOrcamento` completo. A página salva `{ descricao, dados }` em `sessionStorage` via `salvarOrcamento` e navega para `/revisao`.
3. `src/app/revisao/page.tsx` — fluxo de **dois passos na mesma rota**. Passo 1: editar variante do serviço (`serviceBandId`), área/quantidade, complexidade, fatores de execução, estado da superfície, patologias, preparações e ocupação; recalcular em tempo real; ajustar `valor_final` via slider. Alertas de atenção (infiltração ativa, estado crítico, trinca profunda) exibidos acima da lista. Passo 2: inserir nome do cliente, observações e condições do orçamento (drag-and-drop, carregadas do perfil como defaults), gerar PDF. Após geração, exibe tela de sucesso com download (desktop) ou compartilhamento nativo via Web Share API (mobile).
4. `src/app/orcamento/page.tsx` — **redirect stub**: redireciona para `/` imediatamente. Rota legada mantida para não quebrar bookmarks.
5. `src/app/api/gerar-pdf/route.tsx` — valida o body com guards e renderiza o componente `OrcamentoPdf` via `renderToBuffer`. Precisa ser `.tsx` (usa JSX) e `runtime = "nodejs"` (o renderer não roda em edge).
6. `src/app/perfil/page.tsx` — formulário de identidade do pintor (nome, telefone, e-mail, cidade, logo). Dados salvos em `localStorage` via `salvarPerfil`. As condições do orçamento são editadas diretamente no Passo 2 de `/revisao` (carregadas do perfil e salvas de volta ao gerar o PDF).

**Cálculo da faixa de preço** (`src/lib/pricing.ts` + `src/lib/pricing-catalog.ts`): modelo de interpolação por faixa de serviço. Cada `ServiceBandId` tem `{ min, max }` em R$/m² ou R$/un. O preço unitário é `band.min + posicaoFinal × (band.max - band.min)`, onde `posicaoFinal ∈ [0,1]` é a soma de scores de complexidade, estado da superfície, patologias, preparações e ocupação, com caps por grupo. Fatores de execução (`altura_alta`, `acesso_dificil`) aplicam multiplicadores separados (max 1.50×). O cálculo roda **tanto no servidor** (`/api/analisar`) **quanto no client** (`/revisao` recalcula em tempo real) — manter as funções puras é essencial.

Campos ricos de superfície extraídos pela IA e pela heurística:
- `estado_superficie` — `EstadoSuperficie`: excelente / boa / regular / ruim / critica
- `patologias` — `Patologia[]`: trincas, infiltrações, mofo, eflorescência, ferrugem, etc.
- `preparacoes` — `Preparacao[]`: massa corrida, lixamento, impermeabilizante, etc.
- `ocupacao` — `Ocupacao`: vazio / parcialmente_mobiliado / mobiliado
- `serviceBandId` — `ServiceBandId`: variante específica do serviço (ex. `pintura_completa_interna`)

`PricingExplicacao` (retornada em cada `ItemOrcamento.explicacao`) contém o audit trail completo: band usada, posição base/final, fatores aplicados com scores individuais, alertas de atenção.

**Extração** (todas devolvem `DadosExtraidos` com `ItemExtraido[]` — inclui todos os campos ricos além do básico):
- `extract.ts` — heurística por regex; detecta patologias, preparações, estado da superfície, ocupação e `serviceBandId`
- `extract-ai.ts` — **selector**: detecta o provedor (`AI_PROVIDER` explícito → presença de chave) e delega. Contém o `SYSTEM_PROMPT` único compartilhado, que instrui a IA a preencher todos os campos ricos.
- `extract-ai-gemini.ts` — Google Gemini com `responseSchema` (`@google/genai`)
- `extract-ai-openai.ts` — OpenAI com `response_format: json_schema, strict: true`

Para adicionar um novo provedor: criar `extract-ai-<nome>.ts` com `extrairCom<Nome>(descricao, systemPrompt): Promise<DadosExtraidos>`, registrar em `extract-ai.ts` (`detectarProvider` + branch no `extrairComIA`), atualizar `.env.example`.

**Persistência:** `src/lib/storage.ts` — sem banco de dados.
- Orçamento em andamento: `sessionStorage` (limpo ao fechar aba).
- Perfil do pintor: `localStorage` (persiste entre sessões).
Qualquer feature que precise de histórico precisará adicionar um banco.

## Convenções

- Identificadores de domínio (tipos, complexidades, fatores) em **português com underscore** (`pintura_simples`, `parede_ruim`) e seus rótulos visíveis em mapas `*_LABEL`.
- Componentes que usam `sessionStorage`, `useRouter` ou outros browser APIs precisam de `"use client"` e devem fazer `router.replace("/")` se o storage estiver vazio (ver `revisao/page.tsx`).
- API routes que usam `@react-pdf/renderer` ou o SDK da OpenAI: marcar `export const runtime = "nodejs"`.
- Next.js 16: `params`/`searchParams`/`cookies`/`headers` são todos `Promise` (precisam de `await`). Veja `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` antes de usar APIs assíncronas.

## Roadmap (status)

Etapas 1–6 do documento de requisitos estão implementadas. Motor de precificação por faixas (pricing-catalog + campos ricos de superfície) implementado e integrado à UI de revisão.

**Pós-MVP planejado (em ordem):**
1. Banco de dados + histórico de orçamentos
2. Autenticação e área logada
3. Plano pago (monetização por uso)

Fora do escopo do MVP mas no horizonte: multi-usuário, customização de marca no PDF.
