"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/client";
import { carregarPerfil, salvarPerfil } from "@/lib/storage";
import type { PerfilPintor } from "@/lib/types";

const DEFAULTS: PerfilPintor = {
  nome: "",
  telefone: "",
  email: "",
  cidade: "",
  condicoes: [
    "O prazo para finalização dos serviços é de 15 dias úteis.",
    "Para início do trabalho recebemos 20% do valor antecipado.",
    "Este orçamento é válido por 20 dias corridos a partir da data de emissão.",
  ],
};

const inputCls =
  "w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white placeholder-zinc-500 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400";

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

function PerfilContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onboarding = searchParams.get("onboarding") === "1";
  const [perfil, setPerfil] = useState<PerfilPintor>(DEFAULTS);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null); // path no Storage (salvo no DB)
  const [novoArquivoLogo, setNovoArquivoLogo] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: authData }) => {
      const uid = authData.user?.id ?? null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserId(uid);

      // Carrega localStorage imediatamente (rápido)
      if (uid) {
        const local = carregarPerfil(uid);
        if (local) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setPerfil(local);
          if (local.logo_base64) setLogoPreview(local.logo_base64);
        }
      }

      // Sobrescreve com dados do DB se disponível
      fetch("/api/perfil")
        .then((r) => (r.ok ? r.json() : null))
        .then((dbData) => {
          if (!dbData) return;
          const fromDb: PerfilPintor = {
            nome: dbData.nome ?? "",
            telefone: dbData.telefone ?? "",
            email: dbData.email ?? "",
            cidade: dbData.cidade ?? "",
            condicoes: dbData.condicoes ?? DEFAULTS.condicoes,
            logo_base64: undefined,
          };
          setPerfil(fromDb);
          if (dbData.logoUrl) setLogoPreview(dbData.logoUrl);
          if (dbData.logoPath) setLogoPath(dbData.logoPath);
        })
        .catch(() => {/* usa local */});
    });
  }, []);

  function set<K extends keyof PerfilPintor>(field: K, value: PerfilPintor[K]) {
    setPerfil((prev) => ({ ...prev, [field]: value }));
  }

  function mascaraTelefone(valor: string): string {
    const d = valor.replace(/\D/g, "").slice(0, 11);
    if (d.length === 0) return "";
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  function aoSelecionarLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNovoArquivoLogo(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setLogoPreview(base64);
    };
    reader.readAsDataURL(file);
  }

  function removerLogo() {
    setLogoPreview(null);
    setLogoPath(null);
    setNovoArquivoLogo(null);
    setPerfil((prev) => ({ ...prev, logo_base64: undefined }));
    if (fileRef.current) fileRef.current.value = "";
  }

  async function aoSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      // Upload do logo se um novo arquivo foi selecionado
      let currentPath = logoPreview ? logoPath : null;
      if (novoArquivoLogo) {
        const form = new FormData();
        form.append("file", novoArquivoLogo);
        const res = await fetch("/api/perfil/logo", { method: "POST", body: form });
        if (!res.ok) throw new Error("Falha ao enviar logo.");
        const { url, path } = await res.json() as { url: string; path: string };
        setLogoPreview(url);
        setLogoPath(path);
        currentPath = path;
      }

      // Salva no DB — logoPath é o path no Storage (ou null se logo removida)
      await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: perfil.nome,
          telefone: perfil.telefone,
          email: perfil.email,
          cidade: perfil.cidade,
          condicoes: perfil.condicoes,
          logoPath: currentPath,
        }),
      });

      // Cache local (sem base64 — evita localStorage pesado)
      if (userId) {
        const perfilLocal: PerfilPintor = { ...perfil, logo_base64: undefined };
        salvarPerfil(userId, perfilLocal);
      }
      setNovoArquivoLogo(null);

      toast.success("Perfil salvo com sucesso!");
    } catch (err) {
      toast.error("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-xl">
          {onboarding && (
            <div className="mb-6 rounded-2xl border border-brand-400/30 bg-brand-400/10 px-5 py-4 text-sm text-brand-300">
              <p className="font-semibold">Bem-vindo ao Pintor Pro IA!</p>
              <p className="mt-0.5 text-brand-400/80">
                Preencha seus dados antes de gerar o primeiro orçamento. Eles aparecem em todos os PDFs enviados aos seus clientes.
              </p>
            </div>
          )}

          <header className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Sua identidade profissional
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Seus dados aparecem em todos os orçamentos gerados.
            </p>
          </header>

          <form onSubmit={aoSalvar} className="space-y-4">
            {/* Logo */}
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
                    className="h-16 w-auto max-w-40 rounded-lg border border-zinc-700 object-contain bg-white p-1"
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
                  Envie sua logo e apareça de forma profissional
                  <span className="text-xs text-zinc-500">
                    PNG, JPG ou SVG · aparece no rodapé de cada orçamento
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

            {/* Identificação */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur sm:p-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
                Seus dados de contato
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
                <Campo label="E-mail">
                  <input
                    className={inputCls}
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={perfil.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Campo>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Campo label="Telefone / WhatsApp">
                    <input
                      className={inputCls}
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={mascaraTelefone(perfil.telefone)}
                      onChange={(e) => set("telefone", e.target.value.replace(/\D/g, "").slice(0, 11))}
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
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-xl border border-zinc-700 bg-transparent px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-400 px-5 py-3.5 text-sm font-bold text-zinc-950 transition hover:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {salvando ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "Salvar meu perfil"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default function PerfilPage() {
  return (
    <Suspense>
      <PerfilContent />
    </Suspense>
  );
}
