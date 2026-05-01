"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { calcularFaixaPreco } from "@/lib/pricing";
import { carregarOrcamento, salvarOrcamento } from "@/lib/storage";
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

export default function RevisaoPage() {
  const router = useRouter();
  const [rascunho, setRascunho] = useState<RascunhoOrcamento | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregado = carregarOrcamento();
    if (!carregado) {
      router.replace("/");
      return;
    }
    setRascunho(carregado);
    setCarregando(false);
  }, [router]);

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

  function aoConfirmar() {
    if (!rascunho) return;
    salvarOrcamento(rascunho);
    router.push("/orcamento");
  }

  if (carregando || !rascunho || !dados || !faixaRecalculada) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">
            Revisar orçamento
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Ajuste os dados extraídos antes de gerar o PDF.
          </p>
        </header>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-500">
            Descrição original
          </h2>
          <p className="mt-2 text-sm whitespace-pre-wrap">
            {rascunho.descricao}
          </p>
        </section>

        <section className="space-y-4">
          <Campo label="Tipo de serviço">
            <select
              value={dados.tipo}
              onChange={(e) =>
                atualizar({ tipo: e.target.value as TipoServico })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {TIPOS_SERVICO.map((t) => (
                <option key={t} value={t}>
                  {TIPOS_SERVICO_LABEL[t]}
                </option>
              ))}
            </select>
          </Campo>

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
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </Campo>

          <Campo label="Complexidade">
            <select
              value={dados.complexidade}
              onChange={(e) =>
                atualizar({ complexidade: e.target.value as Complexidade })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {COMPLEXIDADES.map((c) => (
                <option key={c} value={c}>
                  {COMPLEXIDADES_LABEL[c]}
                </option>
              ))}
            </select>
          </Campo>

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
                      "rounded-full border px-3 py-1 text-xs transition " +
                      (ativo
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300")
                    }
                  >
                    {FATORES_LABEL[f]}
                  </button>
                );
              })}
            </div>
          </Campo>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-500">
            Faixa sugerida
          </h2>
          <p className="mt-1 text-2xl font-semibold">
            {formatadorBRL.format(dados.faixa_preco_min)}
            <span className="mx-2 text-zinc-400">—</span>
            {formatadorBRL.format(dados.faixa_preco_max)}
          </p>

          <div className="mt-6">
            <div className="flex items-baseline justify-between mb-2">
              <label htmlFor="valor_final" className="text-sm font-medium">
                Valor final
              </label>
              <span className="text-2xl font-bold tabular-nums">
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
        </section>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-5 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={aoConfirmar}
            className="flex-1 rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Gerar PDF
          </button>
        </div>
      </div>
    </main>
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
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
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
    <div>
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full bg-zinc-200 dark:bg-zinc-800"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-zinc-400 dark:bg-zinc-600"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
        />
        <input
          id="valor_final"
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={10}
          value={Math.min(Math.max(valor, sliderMin), sliderMax)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full appearance-none bg-transparent cursor-pointer h-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-900 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow dark:[&::-webkit-slider-thumb]:bg-zinc-100 dark:[&::-webkit-slider-thumb]:border-zinc-900 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-zinc-900 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white dark:[&::-moz-range-thumb]:bg-zinc-100"
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-zinc-500">
        <span>{formatadorBRL.format(sliderMin)}</span>
        <span>{formatadorBRL.format(sliderMax)}</span>
      </div>
    </div>
  );
}
