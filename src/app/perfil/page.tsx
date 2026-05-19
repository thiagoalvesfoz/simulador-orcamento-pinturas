"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  condicoes: [
    "O prazo para finalização dos serviços é de 15 dias úteis.",
    "Para início do trabalho recebemos 20% do valor antecipado.",
    "Este orçamento é válido por 20 dias corridos a partir da data de emissão.",
  ],
};

const inputCls =
  "w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400";

const MAX_CHARS = 135;

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

function CondicaoItem({
  id,
  cond,
  onRemove,
  isRemoving,
}: {
  id: string;
  cond: string;
  onRemove: () => void;
  isRemoving?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: isRemoving ? "translateY(6px)" : CSS.Transform.toString(transform),
        transition: isRemoving ? "opacity 250ms ease, transform 250ms ease" : transition,
        opacity: isDragging ? 0.4 : isRemoving ? 0 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      className="flex cursor-grab items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950/60 px-3 py-3 touch-none active:cursor-grabbing"
      suppressHydrationWarning
      {...attributes}
      {...listeners}
    >
      <span className="shrink-0 text-zinc-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
        >
          <circle cx="6" cy="6" r="1.5" />
          <circle cx="12" cy="6" r="1.5" />
          <circle cx="18" cy="6" r="1.5" />
          <circle cx="6" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="18" cy="12" r="1.5" />
          <circle cx="6" cy="18" r="1.5" />
          <circle cx="12" cy="18" r="1.5" />
          <circle cx="18" cy="18" r="1.5" />
        </svg>
      </span>

      <span className="flex-1 text-sm text-zinc-200 leading-snug">{cond}</span>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Remover condição"
        className="shrink-0 rounded-lg p-1.5 text-red-400 transition hover:bg-red-500/10 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </li>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilPintor>(DEFAULTS);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [novaCondicao, setNovaCondicao] = useState("");
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const saved = carregarPerfil();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPerfil(saved);
      if (saved.logo_base64) setLogoPreview(saved.logo_base64);
    }
  }, []);

  function set<K extends keyof PerfilPintor>(field: K, value: PerfilPintor[K]) {
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

  function adicionarCondicao() {
    const txt = novaCondicao.trim();
    if (!txt) return;
    set("condicoes", [...perfil.condicoes, txt]);
    setNovaCondicao("");
  }

  function removerCondicao(idx: number) {
    const id = `cond-${idx}`;
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      set("condicoes", perfil.condicoes.filter((_, i) => i !== idx));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 250);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = perfil.condicoes.findIndex(
      (_, i) => `cond-${i}` === active.id
    );
    const newIdx = perfil.condicoes.findIndex(
      (_, i) => `cond-${i}` === over.id
    );
    if (oldIdx !== -1 && newIdx !== -1) {
      set("condicoes", arrayMove(perfil.condicoes, oldIdx, newIdx));
    }
  }

  function aoSalvar(e: React.FormEvent) {
    e.preventDefault();
    salvarPerfil(perfil);
    toast.success("Perfil salvo com sucesso!");
  }

  const condicaoIds = perfil.condicoes.map((_, i) => `cond-${i}`);

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Sua identidade profissional
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Configure uma vez — aparece em todas as suas propostas.
            </p>
          </div>

          

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
                    PNG, JPG ou SVG · aparece no rodapé de cada proposta
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

            

            {/* Condições */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur sm:p-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
                Condições da proposta
              </h3>

              {perfil.condicoes.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={condicaoIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="mb-4 space-y-2">
                      {perfil.condicoes.map((cond, idx) => (
                        <CondicaoItem
                          key={condicaoIds[idx]}
                          id={condicaoIds[idx]}
                          cond={cond}
                          onRemove={() => removerCondicao(idx)}
                          isRemoving={removingIds.has(condicaoIds[idx])}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}

              <div className="relative">
                <input
                  className={inputCls + " pr-24"}
                  type="text"
                  placeholder="Ex: Tinta fornecida pelo cliente."
                  maxLength={MAX_CHARS}
                  value={novaCondicao}
                  onChange={(e) => setNovaCondicao(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      adicionarCondicao();
                    }
                  }}
                />
                <div className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
                  <span className="text-xs text-zinc-500 tabular-nums">
                    {novaCondicao.length}/{MAX_CHARS}
                  </span>
                  <button
                    type="button"
                    onClick={adicionarCondicao}
                    disabled={!novaCondicao.trim()}
                    className={`pointer-events-auto flex h-7 w-7 items-center justify-center rounded-lg transition ${novaCondicao.trim() ? "bg-brand-400 text-zinc-950 hover:bg-brand-300 cursor-pointer" : "bg-zinc-700 text-zinc-400 cursor-not-allowed"}`}
                    aria-label="Adicionar condição"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </section>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900/60 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-brand-400 px-5 py-3.5 text-sm font-bold text-zinc-950 transition hover:bg-brand-300"
              >
                Salvar meu perfil
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
