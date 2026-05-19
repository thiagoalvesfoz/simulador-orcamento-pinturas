"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import BadgeIA from "@/components/BadgeIA";
import Header from "@/components/Header";
import { calcularFaixaPreco } from "@/lib/pricing";
import { carregarOrcamento, carregarPerfil, gerarNumeroOrcamento, salvarOrcamento } from "@/lib/storage";
import {
  COMPLEXIDADES,
  COMPLEXIDADES_LABEL,
  FATORES,
  FATORES_LABEL,
  TIPOS_SERVICO,
  TIPOS_SERVICO_LABEL,
  type Complexidade,
  type DadosOrcamento,
  type Fator,
  type RascunhoOrcamento,
  type TipoServico,
} from "@/lib/types";

const formatadorBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

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

export default function RevisaoPage() {
  const router = useRouter();
  const [rascunho, setRascunho] = useState<RascunhoOrcamento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [baixando, setBaixando] = useState(false);
  const [nomeCliente, setNomeCliente] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [perfilIncompleto, setPerfilIncompleto] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

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
    setCarregando(false);
    toast.success("Orçamento pronto para revisão", { id: "revisao-extraido" });
  }, [router]);

  useEffect(() => {
    if (rascunho) salvarOrcamento(rascunho);
  }, [rascunho]);

  const dados = rascunho?.dados;

  const faixaRecalculada = useMemo(() => {
    if (!dados) return null;
    return calcularFaixaPreco({
      tipo: dados.tipo,
      area_m2: dados.area_m2,
      complexidade: dados.complexidade,
      fatores: dados.fatores,
    });
  }, [dados]);

  function atualizar(patch: Partial<DadosOrcamento>) {
    setRascunho((atual) => {
      if (!atual) return atual;
      const dadosAtualizados = { ...atual.dados, ...patch };

      const precisaRecalcular =
        "tipo" in patch ||
        "area_m2" in patch ||
        "complexidade" in patch ||
        "fatores" in patch;

      if (precisaRecalcular) {
        const novaFaixa = calcularFaixaPreco({
          tipo: dadosAtualizados.tipo,
          area_m2: dadosAtualizados.area_m2,
          complexidade: dadosAtualizados.complexidade,
          fatores: dadosAtualizados.fatores,
        });
        dadosAtualizados.faixa_preco_min = novaFaixa.faixa_preco_min;
        dadosAtualizados.faixa_preco_max = novaFaixa.faixa_preco_max;
        if (
          dadosAtualizados.valor_final < novaFaixa.faixa_preco_min ||
          dadosAtualizados.valor_final > novaFaixa.faixa_preco_max
        ) {
          dadosAtualizados.valor_final = Math.round(
            (novaFaixa.faixa_preco_min + novaFaixa.faixa_preco_max) / 2
          );
        }
      }

      return { ...atual, dados: dadosAtualizados };
    });
  }

  function alternarFator(fator: Fator) {
    if (!dados) return;
    const tem = dados.fatores.includes(fator);
    atualizar({
      fatores: tem
        ? dados.fatores.filter((f) => f !== fator)
        : [...dados.fatores, fator],
    });
  }

  async function aoGerarPdf() {
    if (!rascunho || baixando) return;
    setBaixando(true);
    try {
      const perfil = carregarPerfil();
      const numero = gerarNumeroOrcamento();
      const resposta = await fetch("/api/gerar-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...rascunho,
          nome_cliente: nomeCliente.trim() || undefined,
          observacoes: observacoes.trim() || undefined,
          perfil: perfil ?? undefined,
          numero_orcamento: numero,
        }),
      });
      if (!resposta.ok) throw new Error("Falha ao gerar PDF.");
      const blob = await resposta.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orcamento-${numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF baixado com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar PDF.");
    } finally {
      setBaixando(false);
    }
  }

  if (carregando || !rascunho || !dados || !faixaRecalculada) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </main>
    );
  }

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-xl">
          <header className="mb-6 text-center">
            <BadgeIA />
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
              Revisar orçamento
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Ajuste os dados e personalize o PDF em 2 passos
            </p>
          </header>

          {perfilIncompleto && (
            <Link
              href="/perfil"
              className="mb-4 flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300 transition hover:bg-amber-500/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 shrink-0"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>
                Seu perfil está incompleto — o PDF não terá seus dados de
                contato.{" "}
                <span className="font-semibold underline underline-offset-2">
                  Configurar agora
                </span>
              </span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mb-4 mt-5 flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 px-5 py-3 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
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
                  Revisão do orçamento
                </p>
                {step === 2 && (
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {TIPOS_SERVICO_LABEL[dados.tipo]} · {dados.area_m2}m² ·{" "}
                    {formatadorBRL.format(dados.valor_final)}
                  </p>
                )}
              </div>
              {step === 2 && (
                <span className="text-xs font-semibold text-brand-400">
                  Editar
                </span>
              )}
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                step === 1 ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
              <div className="border-t border-zinc-800 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
                <Campo label="Descrição original">
                  <div className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-300">
                    {rascunho.descricao}
                  </div>
                </Campo>

                <Campo label="Tipo de serviço">
                  <SelectDark
                    value={dados.tipo}
                    onChange={(v) => atualizar({ tipo: v as TipoServico })}
                    options={TIPOS_SERVICO.map((t) => ({
                      value: t,
                      label: TIPOS_SERVICO_LABEL[t],
                    }))}
                  />
                </Campo>

                <div className="grid grid-cols-2 gap-4">
                  <Campo label="Área (m²)">
                    <input
                      type="number"
                      min={1}
                      step="0.5"
                      value={dados.area_m2}
                      onChange={(e) =>
                        atualizar({
                          area_m2: Math.max(1, Number(e.target.value) || 0),
                        })
                      }
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20"
                    />
                  </Campo>

                  <Campo label="Complexidade">
                    <SelectDark
                      value={dados.complexidade}
                      onChange={(v) =>
                        atualizar({ complexidade: v as Complexidade })
                      }
                      options={COMPLEXIDADES.map((c) => ({
                        value: c,
                        label: COMPLEXIDADES_LABEL[c],
                      }))}
                    />
                  </Campo>
                </div>

                <Campo label="Fatores adicionais">
                  <div className="flex flex-wrap gap-2">
                    {FATORES.map((f) => {
                      const ativo = dados.fatores.includes(f);
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => alternarFator(f)}
                          className={
                            "cursor-pointer rounded-full border px-4 py-1.5 text-xs font-medium transition " +
                            (ativo
                              ? "border-brand-400 bg-brand-400 text-zinc-950"
                              : "border-zinc-700 bg-transparent text-zinc-200 hover:border-brand-400/60 hover:text-white")
                          }
                        >
                          {FATORES_LABEL[f]}
                        </button>
                      );
                    })}
                  </div>
                </Campo>

                <div className="mt-1 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-xs font-medium text-zinc-400">
                    Faixa sugerida
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white tabular-nums">
                    {formatadorBRL.format(dados.faixa_preco_min)}
                    <span className="mx-2 text-zinc-500">—</span>
                    {formatadorBRL.format(dados.faixa_preco_max)}
                  </p>

                  <div className="my-4 border-t border-zinc-800" />

                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-white">
                      Valor final
                    </span>
                    <span className="text-2xl font-bold text-white tabular-nums">
                      {formatadorBRL.format(dados.valor_final)}
                    </span>
                  </div>

                  <SliderValor
                    min={dados.faixa_preco_min}
                    max={dados.faixa_preco_max}
                    valor={dados.valor_final}
                    onChange={(v) => atualizar({ valor_final: v })}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-400 px-5 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-brand-400/20 transition hover:bg-brand-300"
                >
                  Confirmar dados
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            <div
              className={`flex items-center gap-3 p-5 sm:p-6 ${
                step === 1 ? "opacity-50" : ""
              }`}
            >
              <StepBadge step={2} done={false} pending={step === 1} />
              <p className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Personalizar PDF
              </p>
            </div>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                step === 2 ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
              <div className="border-t border-zinc-800 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
                <Campo label="Nome do cliente">
                  <input
                    type="text"
                    placeholder="Ex: João Silva"
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20"
                  />
                </Campo>

                <Campo label="Observações (opcional)">
                  <textarea
                    rows={3}
                    placeholder="Ex: inclui 2 demãos, tinta fornecida pelo cliente..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20"
                  />
                </Campo>

                <button
                  type="button"
                  onClick={aoGerarPdf}
                  disabled={baixando}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-400 px-5 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-brand-400/20 transition hover:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-60"
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  {baixando ? "Gerando..." : "Gerar PDF"}
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

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
        {label}
      </label>
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
        className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 pr-10 text-sm text-zinc-100 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20"
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
      <div className="relative h-5">
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
          className="relative w-full appearance-none bg-transparent cursor-pointer h-5 [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-400 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:-mt-1.75 [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-400"
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-zinc-500 tabular-nums">
        <span>{formatadorBRL.format(sliderMin)}</span>
        <span>{formatadorBRL.format(sliderMax)}</span>
      </div>
    </div>
  );
}
