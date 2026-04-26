"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import VozRecorder from "@/components/VozRecorder";
import { salvarOrcamento } from "@/lib/storage";

export default function Home() {
  const router = useRouter();
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoEnviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);

    const texto = descricao.trim();
    if (texto.length < 10) {
      setErro("Descreva o serviço com pelo menos 10 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      const resposta = await fetch("/api/analisar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao: texto }),
      });

      if (!resposta.ok) {
        throw new Error("Falha ao analisar a descrição.");
      }

      const dados = await resposta.json();
      salvarOrcamento({ descricao: texto, dados });
      router.push("/revisao");
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : "Não foi possível processar a descrição."
      );
      setEnviando(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Orçamento de Pintura
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Descreva o serviço que será executado. A IA vai sugerir uma faixa
            de preço para você revisar.
          </p>
        </header>

        <form onSubmit={aoEnviar} className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="descricao" className="block text-sm font-medium">
                Descrição do serviço
              </label>
              <VozRecorder
                onTranscricao={setDescricao}
                desabilitado={enviando}
              />
            </div>
            <textarea
              id="descricao"
              name="descricao"
              rows={8}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex.: Pintura interna de uma sala de 30m² com paredes em bom estado, duas demãos de tinta acrílica."
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base shadow-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
              disabled={enviando}
            />
            <p className="mt-1 text-xs text-zinc-500">
              Você pode digitar ou ditar a descrição (Chrome/Edge).
            </p>
          </div>

          {erro && (
            <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {enviando ? "Analisando..." : "Gerar orçamento"}
          </button>
        </form>
      </div>
    </main>
  );
}
