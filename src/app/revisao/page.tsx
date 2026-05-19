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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { calcularOrcamento, calcularSubtotalItem } from "@/lib/pricing";
import { CATALOG_BY_ID, TIPO_TO_DEFAULT_BAND } from "@/lib/pricing-catalog";
import {
  carregarOrcamento,
  carregarPerfil,
  gerarNumeroOrcamento,
  limparOrcamento,
  salvarOrcamento,
  salvarPerfil,
} from "@/lib/storage";
import {
  COMPLEXIDADES,
  COMPLEXIDADES_LABEL,
  ESTADOS_SUPERFICIE,
  ESTADOS_SUPERFICIE_LABEL,
  FATORES_LABEL,
  OCUPACOES,
  OCUPACOES_LABEL,
  PATOLOGIAS,
  PATOLOGIAS_LABEL,
  PREPARACOES,
  PREPARACOES_LABEL,
  SERVICE_BAND_LABELS,
  TIPOS_SERVICO,
  TIPOS_SERVICO_LABEL,
  UNIDADE_POR_TIPO,
  type Complexidade,
  type EstadoSuperficie,
  type Fator,
  type ItemOrcamento,
  type Ocupacao,
  type Patologia,
  type Preparacao,
  type RascunhoOrcamento,
  type ServiceBandId,
  type TipoServico,
} from "@/lib/types";

const formatadorBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const FATORES_EXECUCAO: Fator[] = ["altura_alta", "acesso_dificil"];

const TIPO_TO_BANDS: Record<TipoServico, ServiceBandId[]> = {
  pintura_parede:       ["pintura_simples_interna", "pintura_completa_interna", "pintura_alto_padrao"],
  pintura_teto:         ["teto_simples", "teto_completo"],
  pintura_externa:      ["fachada_simples", "fachada_completa"],
  textura:              ["textura_rolada", "textura_projetada"],
  efeito_decorativo:    ["cimento_queimado", "marmorizacao_simples", "marmorizacao_premium", "efeito_veludo", "efeito_linho"],
  pintura_grade:        ["grade_m2"],
  pintura_telhado:      ["telhado_simples", "telhado_tratamento"],
  pintura_piso:         ["piso_calcada", "piso_epoxi", "piso_demarcacao"],
  pintura_porta_janela: ["porta_lisa", "janela"],
  pintura_portao:       ["portao_pequeno", "portao_medio", "portao_grande"],
};

type EditPatch = {
  tipo: TipoServico;
  quantidade: number;
  complexidade: Complexidade;
  fatores: Fator[];
  serviceBandId: ServiceBandId;
  estado_superficie?: EstadoSuperficie;
  patologias: Patologia[];
  preparacoes: Preparacao[];
  ocupacao?: Ocupacao;
};

const DEFAULTS_CONDICOES = [
  "O prazo para finalização dos serviços é de 15 dias úteis.",
  "Para início do trabalho recebemos 20% do valor antecipado.",
  "Este orçamento é válido por 20 dias corridos a partir da data de emissão.",
];

const MAX_CHARS_COND = 135;

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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <circle cx="6" cy="6" r="1.5" /><circle cx="12" cy="6" r="1.5" /><circle cx="18" cy="6" r="1.5" />
          <circle cx="6" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" />
          <circle cx="6" cy="18" r="1.5" /><circle cx="12" cy="18" r="1.5" /><circle cx="18" cy="18" r="1.5" />
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" /><path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </li>
  );
}

// ── Shared UI components ──────────────────────────────────────────────────────

function StepBadge({
  step,
  done,
  pending,
}: {
  step: number;
  done: boolean;
  pending?: boolean;
}) {
  if (done) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-zinc-950"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
        pending
          ? "border-zinc-700 text-zinc-600"
          : "border-brand-400 text-brand-400"
      }`}
    >
      {step}
    </span>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

function SelectDark({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-950/70 px-4 py-3 pr-10 text-base text-zinc-100 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-zinc-900">
            {o.label}
          </option>
        ))}
      </select>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        aria-hidden
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

function ChipToggle({
  label,
  ativo,
  onClick,
}: {
  label: string;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "cursor-pointer rounded-full border px-3 py-2 text-xs font-medium transition text-left " +
        (ativo
          ? "border-brand-400/25 bg-brand-400/8 text-brand-300"
          : "border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:border-brand-400/60 hover:bg-zinc-800 hover:text-white")
      }
    >
      {label}
    </button>
  );
}

function SliderValor({
  min,
  max,
  valor,
  onChange,
}: {
  min: number;
  max: number;
  valor: number;
  onChange: (v: number) => void;
}) {
  const sliderMin = Math.max(0, Math.round(min * 0.5));
  const sliderMax = Math.round(max * 1.5);
  const range = sliderMax - sliderMin;
  const pctMin = range > 0 ? ((min - sliderMin) / range) * 100 : 0;
  const pctMax = range > 0 ? ((max - sliderMin) / range) * 100 : 100;

  return (
    <div className="mt-4">
      <div className="relative h-11">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 rounded-full bg-zinc-800"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-400"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
        />
        <input
          aria-label="Valor final"
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={10}
          value={Math.min(Math.max(valor, sliderMin), sliderMax)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full appearance-none bg-transparent cursor-pointer h-11 [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-400 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:-mt-[0.5625rem] [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-400"
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-zinc-400 tabular-nums">
        <span>{formatadorBRL.format(sliderMin)}</span>
        <span>{formatadorBRL.format(sliderMax)}</span>
      </div>
    </div>
  );
}

// ── Item card (collapsed view) ────────────────────────────────────────────────

function ItemCard({
  item,
  podeRemover,
  onEdit,
  onRemove,
}: {
  item: ItemOrcamento;
  podeRemover: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const unidadeLabel = item.unidade === "m2" ? "m²" : "un";
  const bandLabel = item.serviceBandId
    ? SERVICE_BAND_LABELS[item.serviceBandId]
    : TIPOS_SERVICO_LABEL[item.tipo];
  const band = item.serviceBandId ? CATALOG_BY_ID[item.serviceBandId] : null;
  const bandRange = band
    ? `R$${band.min}–${band.max}${band.unidade === "m2" ? "/m²" : "/un"}`
    : null;
  const temAlertas = (item.explicacao?.alertas?.length ?? 0) > 0;
  const nExtras =
    item.fatores.filter((f) => f === "altura_alta" || f === "acesso_dificil").length +
    (item.patologias?.length ?? 0);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950/50 px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-zinc-100 truncate">{bandLabel}</p>
          {temAlertas && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 shrink-0 text-amber-400"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}
        </div>
        <p className="mt-0.5 text-xs text-zinc-400">
          {item.quantidade} {unidadeLabel}
          {bandRange && <> · {bandRange}</>}
          {nExtras > 0 && (
            <> · {nExtras} {nExtras === 1 ? "fator" : "fatores"}</>
          )}
        </p>
      </div>
      <p className="shrink-0 text-sm font-bold text-brand-400 tabular-nums">
        {formatadorBRL.format(item.subtotal)}
      </p>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          aria-label="Editar item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        {podeRemover && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
            aria-label="Remover item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Item edit form (expanded view) ────────────────────────────────────────────

function ItemEditForm({
  item,
  onConfirm,
  onCancel,
}: {
  item: ItemOrcamento;
  onConfirm: (patch: EditPatch) => void;
  onCancel: () => void;
}) {
  const [tipo, setTipo] = useState<TipoServico>(item.tipo);
  const [bandId, setBandId] = useState<ServiceBandId>(
    item.serviceBandId ?? TIPO_TO_DEFAULT_BAND[item.tipo]
  );
  const [quantidade, setQuantidade] = useState(item.quantidade);
  const [complexidade, setComplexidade] = useState<Complexidade>(item.complexidade);
  const [fatores, setFatores] = useState<Fator[]>(
    item.fatores.filter((f) => f === "altura_alta" || f === "acesso_dificil")
  );
  const [patologias, setPatologias] = useState<Patologia[]>(item.patologias ?? []);
  const [preparacoes, setPreparacoes] = useState<Preparacao[]>(item.preparacoes ?? []);
  const [estadoSup, setEstadoSup] = useState<EstadoSuperficie | "">(
    item.estado_superficie ?? ""
  );
  const [ocupacao, setOcupacao] = useState<Ocupacao | "">(item.ocupacao ?? "");

  const unidade = UNIDADE_POR_TIPO[tipo];

  function handleTipoChange(v: string) {
    const novoTipo = v as TipoServico;
    setTipo(novoTipo);
    setBandId(TIPO_TO_DEFAULT_BAND[novoTipo]);
    if (UNIDADE_POR_TIPO[novoTipo] !== unidade) {
      setQuantidade(UNIDADE_POR_TIPO[novoTipo] === "un" ? 1 : 20);
    }
  }

  function toggleFator(f: Fator) {
    setFatores((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]));
  }

  function togglePatologia(p: Patologia) {
    setPatologias((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  function togglePreparacao(p: Preparacao) {
    setPreparacoes((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  return (
    <div className="rounded-xl border border-brand-400/30 bg-zinc-900/80 p-4">
      <Campo label="Tipo de serviço">
        <SelectDark
          value={tipo}
          onChange={handleTipoChange}
          options={TIPOS_SERVICO.map((t) => ({ value: t, label: TIPOS_SERVICO_LABEL[t] }))}
        />
      </Campo>

      <Campo label="Variante do serviço">
        <SelectDark
          value={bandId}
          onChange={(v) => setBandId(v as ServiceBandId)}
          options={TIPO_TO_BANDS[tipo].map((id) => ({
            value: id,
            label: SERVICE_BAND_LABELS[id],
          }))}
        />
      </Campo>

      <div className="grid grid-cols-2 gap-4">
        <Campo label={unidade === "m2" ? "Área (m²)" : "Quantidade (un)"}>
          <input
            type="number"
            min={1}
            step={unidade === "m2" ? "0.5" : "1"}
            value={quantidade}
            onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value) || 0))}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-4 py-3 text-base text-zinc-100 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20"
          />
        </Campo>
        <Campo label="Qualidade do acabamento">
          <SelectDark
            value={complexidade}
            onChange={(v) => setComplexidade(v as Complexidade)}
            options={COMPLEXIDADES.map((c) => ({ value: c, label: COMPLEXIDADES_LABEL[c] }))}
          />
        </Campo>
      </div>

      <Campo label="Dificuldade de execução">
        <div className="grid grid-cols-2 gap-2">
          {FATORES_EXECUCAO.map((f) => (
            <ChipToggle
              key={f}
              label={FATORES_LABEL[f]}
              ativo={fatores.includes(f)}
              onClick={() => toggleFator(f)}
            />
          ))}
        </div>
      </Campo>

      <Campo label="Patologias detectadas">
        <div className="grid grid-cols-2 gap-2">
          {PATOLOGIAS.map((p) => (
            <ChipToggle
              key={p}
              label={PATOLOGIAS_LABEL[p]}
              ativo={patologias.includes(p)}
              onClick={() => togglePatologia(p)}
            />
          ))}
        </div>
      </Campo>

      <Campo label="Preparações incluídas">
        <div className="grid grid-cols-2 gap-2">
          {PREPARACOES.map((p) => (
            <ChipToggle
              key={p}
              label={PREPARACOES_LABEL[p]}
              ativo={preparacoes.includes(p)}
              onClick={() => togglePreparacao(p)}
            />
          ))}
        </div>
      </Campo>

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Estado da superfície">
          <SelectDark
            value={estadoSup}
            onChange={(v) => setEstadoSup(v as EstadoSuperficie | "")}
            options={[
              { value: "", label: "Não informado" },
              ...ESTADOS_SUPERFICIE.map((e) => ({
                value: e,
                label: ESTADOS_SUPERFICIE_LABEL[e],
              })),
            ]}
          />
        </Campo>
        <Campo label="Ocupação do imóvel">
          <SelectDark
            value={ocupacao}
            onChange={(v) => setOcupacao(v as Ocupacao | "")}
            options={[
              { value: "", label: "Não informado" },
              ...OCUPACOES.map((o) => ({ value: o, label: OCUPACOES_LABEL[o] })),
            ]}
          />
        </Campo>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            onConfirm({
              tipo,
              quantidade,
              complexidade,
              fatores,
              serviceBandId: bandId,
              estado_superficie: estadoSup !== "" ? estadoSup : undefined,
              patologias,
              preparacoes,
              ocupacao: ocupacao !== "" ? ocupacao : undefined,
            })
          }
          className="flex-1 rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-brand-300"
        >
          Confirmar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RevisaoPage() {
  const router = useRouter();
  const [rascunho, setRascunho] = useState<RascunhoOrcamento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [baixando, setBaixando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [baixado, setBaixado] = useState(false);
  const [numeroGerado, setNumeroGerado] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [nomeCliente, setNomeCliente] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [perfilIncompleto, setPerfilIncompleto] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [podeCompartilharArquivo, setPodeCompartilharArquivo] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [condicoes, setCondicoes] = useState<string[]>([]);
  const [novaCondicao, setNovaCondicao] = useState("");
  const [removingCondIds, setRemovingCondIds] = useState<Set<string>>(new Set());

  const condSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const f = new File([""], "test.pdf", { type: "application/pdf" });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPodeCompartilharArquivo(isMobile && !!navigator.canShare?.({ files: [f] }));
    } catch {
      setPodeCompartilharArquivo(false);
    }
  }, []);

  useEffect(() => {
    if (!baixando) return;
    const id = setInterval(() => {
      setProgresso((p) => (p >= 75 ? p : Math.min(75, p + (75 - p) * 0.1)));
    }, 300);
    return () => clearInterval(id);
  }, [baixando]);

  useEffect(() => {
    const carregado = carregarOrcamento();
    if (!carregado) {
      router.replace("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRascunho(carregado);
    const perfil = carregarPerfil();
    if (!perfil || !perfil.nome.trim()) setPerfilIncompleto(true);
     
    setCondicoes(perfil?.condicoes ?? DEFAULTS_CONDICOES);
    setCarregando(false);
  }, [router]);

  useEffect(() => {
    if (rascunho) salvarOrcamento(rascunho);
  }, [rascunho]);

  useEffect(() => {
    if (step !== 2) return;
    const perfil = carregarPerfil();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPerfilIncompleto(!perfil || !perfil.nome.trim());
  }, [step]);

  const dados = rascunho?.dados;

  // ── Item management ───────────────────────────────────────────────────────

  function atualizarItem(id: string, patch: EditPatch) {
    setRascunho((prev) => {
      if (!prev) return prev;
      const unidade = UNIDADE_POR_TIPO[patch.tipo];
      const { subtotal, explicacao } = calcularSubtotalItem({
        tipo: patch.tipo,
        quantidade: patch.quantidade,
        complexidade: patch.complexidade,
        fatores: patch.fatores,
        serviceBandId: patch.serviceBandId,
        estado_superficie: patch.estado_superficie ?? null,
        patologias: patch.patologias.length > 0 ? patch.patologias : null,
        preparacoes: patch.preparacoes.length > 0 ? patch.preparacoes : null,
        ocupacao: patch.ocupacao ?? null,
      });
      const novoItem: ItemOrcamento = {
        id,
        unidade,
        subtotal,
        tipo: patch.tipo,
        quantidade: patch.quantidade,
        complexidade: patch.complexidade,
        fatores: patch.fatores,
        serviceBandId: patch.serviceBandId,
        estado_superficie: patch.estado_superficie,
        patologias: patch.patologias.length > 0 ? patch.patologias : undefined,
        preparacoes: patch.preparacoes.length > 0 ? patch.preparacoes : undefined,
        ocupacao: patch.ocupacao,
        explicacao,
      };
      const novoItens = prev.dados.itens.map((i) => (i.id === id ? novoItem : i));
      const faixa = calcularOrcamento(novoItens);
      const valorFinal =
        prev.dados.valor_final >= faixa.faixa_preco_min &&
        prev.dados.valor_final <= faixa.faixa_preco_max
          ? prev.dados.valor_final
          : Math.round((faixa.faixa_preco_min + faixa.faixa_preco_max) / 2);
      return {
        ...prev,
        dados: { ...prev.dados, itens: novoItens, ...faixa, valor_final: valorFinal },
      };
    });
  }

  function adicionarItem() {
    const novoId = `item-${Math.random().toString(36).slice(2, 7)}`;
    const tipo = "pintura_parede" as TipoServico;
    const serviceBandId = TIPO_TO_DEFAULT_BAND[tipo];
    const { subtotal, explicacao } = calcularSubtotalItem({
      tipo,
      quantidade: 20,
      complexidade: "media",
      fatores: [],
      serviceBandId,
    });
    const novoItem: ItemOrcamento = {
      id: novoId,
      unidade: "m2",
      tipo,
      quantidade: 20,
      complexidade: "media",
      fatores: [],
      serviceBandId,
      subtotal,
      explicacao,
    };
    setRascunho((prev) => {
      if (!prev) return prev;
      const novoItens = [...prev.dados.itens, novoItem];
      const faixa = calcularOrcamento(novoItens);
      return {
        ...prev,
        dados: {
          ...prev.dados,
          itens: novoItens,
          ...faixa,
          valor_final: Math.round((faixa.faixa_preco_min + faixa.faixa_preco_max) / 2),
        },
      };
    });
    setEditandoId(novoId);
  }

  function removerItem(id: string) {
    setRascunho((prev) => {
      if (!prev || prev.dados.itens.length <= 1) return prev;
      const novoItens = prev.dados.itens.filter((i) => i.id !== id);
      const faixa = calcularOrcamento(novoItens);
      return {
        ...prev,
        dados: {
          ...prev.dados,
          itens: novoItens,
          ...faixa,
          valor_final: Math.round((faixa.faixa_preco_min + faixa.faixa_preco_max) / 2),
        },
      };
    });
    if (editandoId === id) setEditandoId(null);
  }

  function atualizarValorFinal(v: number) {
    setRascunho((prev) =>
      prev ? { ...prev, dados: { ...prev.dados, valor_final: v } } : prev
    );
  }

  function adicionarCondicao() {
    const txt = novaCondicao.trim();
    if (!txt) return;
    setCondicoes((prev) => [...prev, txt]);
    setNovaCondicao("");
  }

  function removerCondicao(idx: number) {
    const id = `cond-${idx}`;
    setRemovingCondIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setCondicoes((prev) => prev.filter((_, i) => i !== idx));
      setRemovingCondIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 250);
  }

  function handleCondDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = condicoes.findIndex((_, i) => `cond-${i}` === active.id);
    const newIdx = condicoes.findIndex((_, i) => `cond-${i}` === over.id);
    if (oldIdx !== -1 && newIdx !== -1) setCondicoes(arrayMove(condicoes, oldIdx, newIdx));
  }

  // ── PDF generation ────────────────────────────────────────────────────────

  async function aoGerarPdf() {
    if (!rascunho || baixando) return;
    setBaixando(true);
    setProgresso(8);
    try {
      const perfilBase = carregarPerfil();
      const perfilFinal = { ...(perfilBase ?? { nome: "", telefone: "", email: "", cidade: "" }), condicoes };
      if (perfilBase) salvarPerfil(perfilFinal);
      const numero = numeroGerado || gerarNumeroOrcamento();
      const resposta = await fetch("/api/gerar-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...rascunho,
          nome_cliente: nomeCliente.trim() || undefined,
          observacoes: observacoes.trim() || undefined,
          perfil: perfilFinal,
          numero_orcamento: numero,
        }),
      });
      if (!resposta.ok) throw new Error("Falha ao gerar PDF.");
      const blob = await resposta.blob();
      setProgresso(100);
      await new Promise((r) => setTimeout(r, 400));
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setNumeroGerado(numero);
      setBaixado(true);
    } catch {
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setBaixando(false);
      setProgresso(0);
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────

  if (baixado && dados) {
    const nomeCli = nomeCliente.trim();
    async function compartilhar() {
      if (!pdfUrl) return;
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const file = new File([blob], `orcamento-${numeroGerado}.pdf`, { type: "application/pdf" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Orçamento ${numeroGerado}`,
            text: "Preparei este orçamento para você. Qualquer dúvida, é só chamar!",
          });
          return;
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
        }
      }
      toast.error("Não foi possível compartilhar. Baixe o PDF e envie manualmente.");
    }

    return (
      <>
        <Header />
        <main className="flex flex-1 flex-col items-center px-4 pt-16 pb-12">
          <div className="w-full max-w-sm text-center">
            <div className="animate-circle-pop mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-400/15">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-brand-400"
              >
                <polyline points="20 6 9 17 4 12" className="animate-check-draw" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Orçamento gerado!
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              {numeroGerado}{nomeCli && <> · {nomeCli}</>}
            </p>

            <div className="mt-6 w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-left">
              <div className="space-y-2.5">
                {dados.itens.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200">
                        {item.serviceBandId
                          ? SERVICE_BAND_LABELS[item.serviceBandId]
                          : TIPOS_SERVICO_LABEL[item.tipo]}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {item.quantidade} {item.unidade === "m2" ? "m²" : "un"} · {COMPLEXIDADES_LABEL[item.complexidade]}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-brand-400/20 pt-2.5">
                  <p className="text-sm font-bold text-zinc-200">
                    Total
                  </p>
                  <p className="text-sm font-bold tabular-nums text-brand-400">
                    {formatadorBRL.format(dados.valor_final)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 w-full">
              {podeCompartilharArquivo ? (
                <button
                  type="button"
                  onClick={compartilhar}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-400 px-5 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-brand-400/20 transition hover:bg-brand-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  Salvar ou compartilhar PDF
                </button>
              ) : (
                <>
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      download={`orcamento-${numeroGerado}.pdf`}
                      className="flex items-center justify-center gap-2 rounded-xl bg-brand-400 px-5 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-brand-400/20 transition hover:bg-brand-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Baixar PDF
                    </a>
                  )}
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                  setPdfUrl(null);
                  setBaixado(false);
                  setEditandoId(null);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3.5 text-sm font-bold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar orçamento
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                  limparOrcamento();
                  router.push("/");
                }}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm text-zinc-500 transition hover:text-zinc-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Novo orçamento
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (carregando || !rascunho || !dados) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </main>
    );
  }

  const itens = dados.itens;
  const alertas = itens.flatMap((i) => i.explicacao?.alertas ?? []);

  // ── Edit / review screen ──────────────────────────────────────────────────

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-xl">
          <header className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Quase lá
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Confira os dados, ajuste o valor e baixe seu orçamento
            </p>
          </header>

          <button
            type="button"
            onClick={() => {
              if (window.confirm("Tem certeza? Os dados do orçamento atual serão perdidos.")) {
                router.push("/");
              }
            }}
            className="mb-5 flex items-center gap-1.5 text-xs text-zinc-400 transition hover:text-zinc-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Voltar ao início
          </button>

          {/* Step 1 */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            <button
              type="button"
              onClick={() => step === 2 && setStep(1)}
              className={`w-full flex items-center gap-3 p-5 sm:p-6 text-left ${
                step === 2
                  ? "cursor-pointer transition hover:bg-zinc-800/40"
                  : "cursor-default"
              }`}
            >
              <StepBadge step={1} done={step === 2} />
              <div className="flex-1">
                <p className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                  {step === 2 ? "Dados confirmados" : "Confira os dados"}
                </p>
                {step === 2 && (
                  <div className="mt-0.5">
                    <p className="text-xs text-zinc-400">
                      {itens.length} {itens.length === 1 ? "serviço" : "serviços"}
                      {itens.length === 1 && ` · ${
                        itens[0].serviceBandId
                          ? SERVICE_BAND_LABELS[itens[0].serviceBandId]
                          : TIPOS_SERVICO_LABEL[itens[0].tipo]
                      }`}
                    </p>
                    <p className="text-base font-bold text-brand-400 tabular-nums">
                      {formatadorBRL.format(dados.valor_final)}
                    </p>
                  </div>
                )}
              </div>
              {step === 2 && (
                <span className="text-xs font-semibold text-brand-400">Editar</span>
              )}
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                step === 1 ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-zinc-800 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">

                  {/* Descrição */}
                  <Campo label="O que você descreveu">
                    <p className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm leading-relaxed text-zinc-300">
                      {rascunho.descricao}
                    </p>
                  </Campo>

                  {/* Alertas */}
                  {alertas.length > 0 && (
                    <div className="mb-4 space-y-1.5">
                      {alertas.map((alerta, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5"
                          >
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                          <p className="text-xs text-amber-300">{alerta}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lista de itens */}
                  <div className="mb-4">
                    <label className="mb-2 block text-xs font-medium text-zinc-400">
                      Serviços do orçamento
                    </label>
                    <div className="space-y-2">
                      {itens.map((item) =>
                        editandoId === item.id ? (
                          <ItemEditForm
                            key={item.id}
                            item={item}
                            onConfirm={(patch) => {
                              atualizarItem(item.id, patch);
                              setEditandoId(null);
                            }}
                            onCancel={() => setEditandoId(null)}
                          />
                        ) : (
                          <ItemCard
                            key={item.id}
                            item={item}
                            podeRemover={itens.length > 1}
                            onEdit={() => setEditandoId(item.id)}
                            onRemove={() => removerItem(item.id)}
                          />
                        )
                      )}
                    </div>

                    {itens.length < 8 && editandoId === null && (
                      <button
                        type="button"
                        onClick={adicionarItem}
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-700 py-2.5 text-xs font-medium text-zinc-400 transition hover:border-brand-400/40 hover:text-zinc-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Adicionar serviço
                      </button>
                    )}
                  </div>

                  {/* Faixa + Valor final */}
                  <div className="rounded-xl border border-brand-400/25 bg-gradient-to-br from-brand-400/8 to-zinc-950/60 p-4">
                    <p className="text-xs font-medium text-zinc-400">Faixa sugerida</p>
                    <p className="mt-2 text-lg font-medium text-zinc-400 tabular-nums">
                      {formatadorBRL.format(dados.faixa_preco_min)}
                      <span className="mx-2 text-zinc-500">—</span>
                      {formatadorBRL.format(dados.faixa_preco_max)}
                    </p>

                    <div className="my-4 border-t border-zinc-800" />

                    <div className="flex flex-col items-end">
                      <span className="text-xs font-medium text-zinc-400">Valor final</span>
                      <span className="text-3xl font-extrabold text-brand-400 tabular-nums">
                        {formatadorBRL.format(dados.valor_final)}
                      </span>
                    </div>

                    <SliderValor
                      min={dados.faixa_preco_min}
                      max={dados.faixa_preco_max}
                      valor={dados.valor_final}
                      onChange={atualizarValorFinal}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-400 px-5 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-brand-400/20 transition hover:bg-brand-300"
                  >
                    Confirmar e continuar
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            <div
              className={`flex items-center gap-3 p-5 sm:p-6 ${
                step === 1 ? "opacity-50" : ""
              }`}
            >
              <StepBadge step={2} done={false} pending={step === 1} />
              <p className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Finalize seu orçamento
              </p>
            </div>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                step === 2 ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-zinc-800 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
                  {perfilIncompleto && (
                    <Link
                      href="/perfil"
                      className="mb-4 flex items-center gap-3 rounded-r-xl border-l-2 border-amber-500 bg-zinc-800/80 px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-amber-400">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>
                        Complete seu perfil para o cliente saber como te contatar.{" "}
                        <span className="font-semibold underline underline-offset-2">Completar perfil</span>
                      </span>
                    </Link>
                  )}

                  <Campo label="Nome do cliente">
                    <input
                      type="text"
                      placeholder="Ex: João Silva"
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-4 py-3 text-base text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20"
                    />
                  </Campo>

                  <Campo label="Observações (opcional)">
                    <textarea
                      rows={2}
                      placeholder="Ex: inclui 2 demãos, tinta fornecida pelo cliente..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950/70 px-4 py-3 text-base text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20"
                    />
                  </Campo>

                  <div className="mt-4 mb-8">
                    <p className="mb-2 text-xs font-medium text-zinc-400">Condições do orçamento</p>
                    {condicoes.length > 0 && (
                      <DndContext sensors={condSensors} collisionDetection={closestCenter} onDragEnd={handleCondDragEnd}>
                        <SortableContext items={condicoes.map((_, i) => `cond-${i}`)} strategy={verticalListSortingStrategy}>
                          <ul className="mb-2 space-y-2">
                            {condicoes.map((cond, idx) => (
                              <CondicaoItem
                                key={`cond-${idx}`}
                                id={`cond-${idx}`}
                                cond={cond}
                                onRemove={() => removerCondicao(idx)}
                                isRemoving={removingCondIds.has(`cond-${idx}`)}
                              />
                            ))}
                          </ul>
                        </SortableContext>
                      </DndContext>
                    )}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ex: Tinta fornecida pelo cliente."
                        maxLength={MAX_CHARS_COND}
                        value={novaCondicao}
                        onChange={(e) => setNovaCondicao(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionarCondicao(); } }}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-4 py-3 pr-24 text-base text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20"
                      />
                      <div className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
                        <span className="text-xs text-zinc-500 tabular-nums">{novaCondicao.length}/{MAX_CHARS_COND}</span>
                        <button
                          type="button"
                          onClick={adicionarCondicao}
                          disabled={!novaCondicao.trim()}
                          className={`pointer-events-auto flex h-7 w-7 items-center justify-center rounded-lg transition ${novaCondicao.trim() ? "bg-brand-400 text-zinc-950 hover:bg-brand-300 cursor-pointer" : "bg-zinc-700 text-zinc-400 cursor-not-allowed"}`}
                          aria-label="Adicionar condição"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={aoGerarPdf}
                    disabled={baixando}
                    className="mt-1 relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-400 px-5 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-brand-400/20 transition hover:bg-brand-300 disabled:cursor-not-allowed"
                  >
                    {baixando && (
                      <div
                        aria-hidden
                        className="absolute inset-y-0 left-0 bg-white/15 transition-[width] duration-700 ease-out"
                        style={{ width: `${progresso}%` }}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      {baixando ? "Montando seu orçamento..." : "Gerar orçamento"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
