import type { RascunhoOrcamento } from "./types";

const STORAGE_KEY = "orcamento_atual";

export function salvarOrcamento(rascunho: RascunhoOrcamento): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rascunho));
}

export function carregarOrcamento(): RascunhoOrcamento | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RascunhoOrcamento;
  } catch {
    return null;
  }
}

export function limparOrcamento(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
