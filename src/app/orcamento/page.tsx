"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { carregarOrcamento, limparOrcamento } from "@/lib/storage";
import {
  COMPLEXIDADES_LABEL,
  FATORES_LABEL,
  TIPOS_SERVICO_LABEL,
  type RascunhoOrcamento,
} from "@/lib/types";

const formatadorBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function OrcamentoPage() {
  const router = useRouter();
  const [rascunho, setRascunho] = useState<RascunhoOrcamento | null>(null);
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregado = carregarOrcamento();
    if (!carregado) {
      router.replace("/");
      return;
    }
    setRascunho(carregado);
  }, [router]);

  async function baixarPdf() {
    if (!rascunho) return;
    setErro(null);
    setBaixando(true);
    try {
      const resposta = await fetch("/api/gerar-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rascunho),
      });
      if (!resposta.ok) {
        throw new Error("Falha ao gerar PDF.");
      }
      const blob = await resposta.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "orcamento.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao gerar PDF.");
    } finally {
      setBaixando(false);
    }
  }

  function novoOrcamento() {
    limparOrcamento();
    router.push("/");
  }

  if (!rascunho) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </main>
    );
  }

  const { dados } = rascunho;
  const fatoresTexto =
    dados.fatores.length > 0
      ? dados.fatores.map((f) => FATORES_LABEL[f]).join(", ")
      : "Nenhum";

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">
            Orçamento pronto
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Confira o resumo e faça o download em PDF.
          </p>
        </header>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                Tipo
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {TIPOS_SERVICO_LABEL[dados.tipo]}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                Área
              </dt>
              <dd className="mt-1 text-sm font-medium">{dados.area_m2} m²</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                Complexidade
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {COMPLEXIDADES_LABEL[dados.complexidade]}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                Fatores
              </dt>
              <dd className="mt-1 text-sm font-medium">{fatoresTexto}</dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Faixa sugerida
            </p>
            <p className="mt-1 text-sm">
              {formatadorBRL.format(dados.faixa_preco_min)} —{" "}
              {formatadorBRL.format(dados.faixa_preco_max)}
            </p>
          </div>

          <div className="mt-4 rounded-md bg-zinc-900 px-4 py-3 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-between">
            <span className="text-sm font-semibold">Valor final</span>
            <span className="text-xl font-bold">
              {formatadorBRL.format(dados.valor_final)}
            </span>
          </div>
        </section>

        {erro && (
          <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/revisao")}
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-5 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            Voltar e editar
          </button>
          <button
            type="button"
            onClick={baixarPdf}
            disabled={baixando}
            className="flex-1 rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {baixando ? "Gerando..." : "Baixar PDF"}
          </button>
        </div>

        <button
          type="button"
          onClick={novoOrcamento}
          className="w-full text-center text-sm text-zinc-500 underline-offset-4 hover:underline"
        >
          Novo orçamento
        </button>
      </div>
    </main>
  );
}
