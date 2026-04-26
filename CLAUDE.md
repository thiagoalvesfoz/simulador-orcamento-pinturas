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
2. `src/app/api/analisar/route.ts` — tenta `extrairComIA` (OpenAI structured outputs); em qualquer falha cai em `extrairHeuristico`. Em seguida chama `calcularFaixaPreco`. Devolve um `DadosOrcamento` completo. A página salva `{ descricao, dados }` em `sessionStorage` via `salvarOrcamento` e navega para `/revisao`.
3. `src/app/revisao/page.tsx` — lê do `sessionStorage`, permite editar tipo/área/complexidade/fatores e recalcula a faixa em tempo real (chama `calcularFaixaPreco` no client). O `valor_final` é puxado para o meio da faixa quando sai do intervalo. Ao confirmar, navega para `/orcamento`.
4. `src/app/orcamento/page.tsx` — mostra o resumo final e POSTa o rascunho para `/api/gerar-pdf`, que retorna o PDF como blob para download.
5. `src/app/api/gerar-pdf/route.tsx` — valida o body com guards e renderiza o componente `OrcamentoPdf` via `renderToBuffer`. Precisa ser `.tsx` (usa JSX) e `runtime = "nodejs"` (o renderer não roda em edge).

**Cálculo da faixa de preço** (`src/lib/pricing.ts`): `preco_base_m2[tipo] × area × multiplicador[complexidade] × (1 + Σ acréscimos[fatores])`, com ±15% para os limites min/max. Se mudar as tabelas, lembre que o cálculo roda **tanto no servidor** (`/api/analisar`) **quanto no client** (`/revisao` recalcula durante a edição) — manter a função pura é importante.

**Extração** (todas devolvem o mesmo shape `DadosExtraidos`, sem os campos de preço — eles vêm do `pricing`):
- `extract.ts` — heurística por regex (fallback sem custo)
- `extract-ai.ts` — **selector**: detecta o provedor (`AI_PROVIDER` explícito → presença de chave) e delega. Contém o `SYSTEM_PROMPT` único compartilhado.
- `extract-ai-gemini.ts` — Google Gemini com `responseSchema` (`@google/genai`)
- `extract-ai-openai.ts` — OpenAI com `response_format: json_schema, strict: true`

Para adicionar um novo provedor: criar `extract-ai-<nome>.ts` com `extrairCom<Nome>(descricao, systemPrompt): Promise<DadosExtraidos>`, registrar em `extract-ai.ts` (`detectarProvider` + branch no `extrairComIA`), atualizar `.env.example`.

**Persistência:** apenas `sessionStorage` em `src/lib/storage.ts`. Não há banco de dados — qualquer feature que precise de histórico precisará adicionar um.

## Convenções

- Identificadores de domínio (tipos, complexidades, fatores) em **português com underscore** (`pintura_simples`, `parede_ruim`) e seus rótulos visíveis em mapas `*_LABEL`.
- Componentes que usam `sessionStorage`, `useRouter` ou outros browser APIs precisam de `"use client"` e devem fazer `router.replace("/")` se o storage estiver vazio (ver `revisao/page.tsx`, `orcamento/page.tsx`).
- API routes que usam `@react-pdf/renderer` ou o SDK da OpenAI: marcar `export const runtime = "nodejs"`.
- Next.js 16: `params`/`searchParams`/`cookies`/`headers` são todos `Promise` (precisam de `await`). Veja `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` antes de usar APIs assíncronas.

## Roadmap (status)

Etapas 1–6 do documento de requisitos estão implementadas. Fora do escopo do MVP: histórico/persistência, autenticação, multi-usuário, customização de marca no PDF.
