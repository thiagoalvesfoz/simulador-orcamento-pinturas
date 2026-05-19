"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Header from "@/components/Header";
import { carregarPerfil, salvarPerfil } from "@/lib/storage";
import type { PerfilPintor } from "@/lib/types";

const DEFAULTS: PerfilPintor = {
  nome: "",
  telefone: "",
  email: "",
  cidade: "",
  prazo_dias: 15,
  entrada_percentual: 20,
  validade_dias: 20,
};

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400";

export default function PerfilPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilPintor>(DEFAULTS);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = carregarPerfil();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPerfil(saved);
      if (saved.logo_base64) setLogoPreview(saved.logo_base64);
    }
  }, []);

  function set(field: keyof PerfilPintor, value: string | number) {
    setPerfil((prev) => ({ ...prev, [field]: value }));
  }

  function aoSelecionarLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setLogoPreview(base64);
      setPerfil((prev) => ({ ...prev, logo_base64: base64 }));
    };
    reader.readAsDataURL(file);
  }

  function removerLogo() {
    setLogoPreview(null);
    setPerfil((prev) => ({ ...prev, logo_base64: undefined }));
    if (fileRef.current) fileRef.current.value = "";
  }

  function aoSalvar(e: React.FormEvent) {
    e.preventDefault();
    salvarPerfil(perfil);
    toast.success("Perfil salvo com sucesso!");
  }

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Seu perfil
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Dados usados nos PDFs gerados para seus clientes.
            </p>
          </div>

          <form onSubmit={aoSalvar} className="space-y-4">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur sm:p-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
                Identificação
              </h3>
              <div className="space-y-4">
                <Campo label="Nome completo ou empresa">
                  <input
                    className={inputCls}
                    type="text"
                    placeholder="Ex: João Silva Pinturas"
                    value={perfil.nome}
                    onChange={(e) => set("nome", e.target.value)}
                  />
                </Campo>
                <div className="grid grid-cols-2 gap-4">
                  <Campo label="Telefone / WhatsApp">
                    <input
                      className={inputCls}
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={perfil.telefone}
                      onChange={(e) => set("telefone", e.target.value)}
                    />
                  </Campo>
                  <Campo label="Cidade">
                    <input
                      className={inputCls}
                      type="text"
                      placeholder="São Paulo - SP"
                      value={perfil.cidade}
                      onChange={(e) => set("cidade", e.target.value)}
                    />
                  </Campo>
                </div>
                <Campo label="E-mail">
                  <input
                    className={inputCls}
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={perfil.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Campo>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur sm:p-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
                Logo
              </h3>
              {logoPreview ? (
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview}
                    alt="Pré-visualização da logo"
                    className="h-16 w-auto max-w-[160px] rounded-lg border border-zinc-700 object-contain bg-white p-1"
                  />
                  <button
                    type="button"
                    onClick={removerLogo}
                    className="text-sm text-zinc-400 underline underline-offset-2 hover:text-white"
                  >
                    Remover logo
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/50 px-4 py-6 text-sm text-zinc-400 transition hover:border-brand-400 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Clique para enviar sua logo
                  <span className="text-xs text-zinc-500">
                    PNG, JPG ou SVG — aparece no PDF
                  </span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={aoSelecionarLogo}
              />
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur sm:p-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
                Condições padrão dos orçamentos
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <Campo label="Prazo (dias úteis)">
                  <input
                    className={inputCls}
                    type="number"
                    min={1}
                    max={365}
                    value={perfil.prazo_dias}
                    onChange={(e) =>
                      set("prazo_dias", Math.max(1, Number(e.target.value)))
                    }
                  />
                </Campo>
                <Campo label="Entrada (%)">
                  <input
                    className={inputCls}
                    type="number"
                    min={0}
                    max={100}
                    value={perfil.entrada_percentual}
                    onChange={(e) =>
                      set(
                        "entrada_percentual",
                        Math.min(100, Math.max(0, Number(e.target.value)))
                      )
                    }
                  />
                </Campo>
                <Campo label="Validade (dias)">
                  <input
                    className={inputCls}
                    type="number"
                    min={1}
                    max={365}
                    value={perfil.validade_dias}
                    onChange={(e) =>
                      set("validade_dias", Math.max(1, Number(e.target.value)))
                    }
                  />
                </Campo>
              </div>
            </section>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900/60 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-brand-400 px-5 py-3.5 text-sm font-bold text-zinc-950 transition hover:bg-brand-300"
              >
                Salvar perfil
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
