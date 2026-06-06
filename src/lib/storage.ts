import type { PerfilPintor } from "./types";

const PERFIL_KEY = (userId: string) => `perfil_pintor_${userId}`;

export function salvarPerfil(userId: string, perfil: PerfilPintor): void {
  localStorage.setItem(PERFIL_KEY(userId), JSON.stringify(perfil));
}

export function carregarPerfil(userId: string): PerfilPintor | null {
  const raw = localStorage.getItem(PERFIL_KEY(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PerfilPintor;
  } catch {
    return null;
  }
}

export function limparPerfilCache(userId: string): void {
  localStorage.removeItem(PERFIL_KEY(userId));
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
