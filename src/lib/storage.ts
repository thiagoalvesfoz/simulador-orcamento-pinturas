import type { PerfilPintor, RascunhoOrcamento } from "./types";

const STORAGE_KEY = "orcamento_atual";
const PERFIL_KEY = "perfil_pintor";

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

export function salvarPerfil(perfil: PerfilPintor): void {
  localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
}

export function carregarPerfil(): PerfilPintor | null {
  const raw = localStorage.getItem(PERFIL_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PerfilPintor;
  } catch {
    return null;
  }
}

export function gerarNumeroOrcamento(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `ORC-${yy}${mm}${dd}-${hh}${min}`;
}
