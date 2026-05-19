"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import BadgeIA from "@/components/BadgeIA";
import Header from "@/components/Header";
import { calcularFaixaPreco } from "@/lib/pricing";
import { carregarOrcamento, carregarPerfil, gerarNumeroOrcamento, limparOrcamento, salvarOrcamento } from "@/lib/storage";
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
  const [progresso, setProgresso] = useState(0);
  const [baixado, setBaixado] = useState(false);
  const [numeroGerado, setNumeroGerado] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [nomeCliente, setNomeCliente] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [perfilIncompleto, setPerfilIncompleto] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [podeCompartilharArquivo, setPodeCompartilharArquivo] = useState(false);

  useEffect(() => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const f = new File([""], "test.pdf", { type: "application/pdf" });
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
    setCarregando(false);
  }, [router]);

  useEffect(() => {
    if (rascunho) salvarOrcamento(rascunho);
  }, [rascunho]);

  useEffect(() => {
    if (step !== 2) return;
    const perfil = carregarPerfil();
    setPerfilIncompleto(!perfil || !perfil.nome.trim());
  }, [step]);

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
    setProgresso(8);
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
      setProgresso(100);
      await new Promise((r) => setTimeout(r, 400));
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setNumeroGerado(numero);
      setBaixado(true);
    } catch (err) {
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setBaixando(false);
      setProgresso(0);
    }
  }

  if (baixado && dados) {
    const perfil = carregarPerfil();
    const nomePintor = perfil?.nome?.trim() ?? "";
    const nomeCli = nomeCliente.trim();
    const valor = formatadorBRL.format(dados.valor_final);
    const textoWa = [
      `Olá${nomeCli ? ` ${nomeCli}` : ""}! Segue o orçamento ${numeroGerado} no valor de ${valor}.`,
      nomePintor ? `Qualquer dúvida estou à disposição. — ${nomePintor}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    const waUrl = `https://wa.me/?text=${encodeURIComponent(textoWa)}`;

    async function compartilhar() {
      if (!pdfUrl) return;
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const file = new File([blob], `orcamento-${numeroGerado}.pdf`, { type: "application/pdf" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: `Orçamento ${numeroGerado}`, text: "Preparei este orçamento para você. Qualquer dúvida, é só chamar!" });
          return;
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
        }
      }
      window.open(waUrl, "_blank", "noopener,noreferrer");
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-zinc-500">Serviço</p>
                  <p className="mt-0.5 text-sm font-medium text-zinc-200">{TIPOS_SERVICO_LABEL[dados.tipo]}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Área</p>
                  <p className="mt-0.5 text-sm font-medium text-zinc-200">{dados.area_m2} m²</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Complexidade</p>
                  <p className="mt-0.5 text-sm font-medium text-zinc-200">{COMPLEXIDADES_LABEL[dados.complexidade]}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Valor final</p>
                  <p className="mt-0.5 text-sm font-bold text-brand-400 tabular-nums">{valor}</p>
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
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3.5 text-sm font-bold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
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
            onClick={() => router.push("/")}
            className="mb-5 flex items-center gap-1.5 text-xs text-zinc-400 transition hover:text-zinc-200"
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
                      {TIPOS_SERVICO_LABEL[dados.tipo]} · {dados.area_m2}m² ·{" "}
                      {COMPLEXIDADES_LABEL[dados.complexidade]}
                      {dados.fatores.length > 0 && (
                        <> · +{dados.fatores.length} {dados.fatores.length === 1 ? "fator" : "fatores"}</>
                      )}
                    </p>
                    <p className="text-base font-bold text-brand-400 tabular-nums">
                      {formatadorBRL.format(dados.valor_final)}
                    </p>
                  </div>
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
                <Campo label="O que você descreveu">
                  <p className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm leading-relaxed text-zinc-300">
                    {rascunho.descricao}
                  </p>
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
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-4 py-3 text-base text-zinc-100 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20"
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
                  <div className="grid grid-cols-2 gap-2">
                    {FATORES.map((f) => {
                      const ativo = dados.fatores.includes(f);
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => alternarFator(f)}
                          className={
                            "cursor-pointer rounded-full border px-4 py-3 text-xs font-medium transition " +
                            (ativo
                              ? "border-brand-400/25 bg-brand-400/8 text-brand-300"
                              : "border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:border-brand-400/60 hover:bg-zinc-800 hover:text-white")
                          }
                        >
                          {FATORES_LABEL[f]}
                        </button>
                      );
                    })}
                  </div>
                </Campo>

                <div className="mt-5 rounded-xl border border-brand-400/25 bg-gradient-to-br from-brand-400/8 to-zinc-950/60 p-4">
                  <p className="text-xs font-medium text-zinc-400">
                    Faixa sugerida
                  </p>
                  <p className="mt-2 text-lg font-medium text-zinc-400 tabular-nums">
                    {formatadorBRL.format(faixaRecalculada.faixa_preco_min)}
                    <span className="mx-2 text-zinc-500">—</span>
                    {formatadorBRL.format(faixaRecalculada.faixa_preco_max)}
                  </p>

                  <div className="my-4 border-t border-zinc-800" />

                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium text-zinc-400">
                      Valor final
                    </span>
                    <span className="text-3xl font-extrabold text-brand-400 tabular-nums">
                      {formatadorBRL.format(dados.valor_final)}
                    </span>
                  </div>

                  <SliderValor
                    min={faixaRecalculada.faixa_preco_min}
                    max={faixaRecalculada.faixa_preco_max}
                    valor={dados.valor_final}
                    onChange={(v) => atualizar({ valor_final: v })}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-400 px-5 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-brand-400/20 transition hover:bg-brand-300"
                >
                  Confirmar e continuar
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 shrink-0 text-amber-400"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>
                      Complete seu perfil para o cliente saber como te contatar.{" "}
                      <span className="font-semibold underline underline-offset-2">
                        Completar perfil
                      </span>
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

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-xs font-medium text-zinc-400">
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
