"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import BadgeIA from "@/components/BadgeIA";
import Header from "@/components/Header";
import { salvarOrcamento } from "@/lib/storage";

const EXEMPLOS = [
  "Preciso pintar uma casa de 70 metros, fazer massa corrida em dois quartos, usar tinta premium, terminar em 3 dias.",
  "Pintura de fachada de 90 m² com textura, tinta para área externa, prazo de 1 semana.",
  "Pintar sala e quarto, 45 metros, com massa corrida, tinta acrílica comum.",
];

const PASSOS = [
  { numero: 1, titulo: "Descreva" },
  { numero: 2, titulo: "IA monta" },
  { numero: 3, titulo: "Recebe PDF" },
];

const FRASES_PENSANDO = [
  "Analisando sua descrição...",
  "Identificando tipo de serviço...",
  "Calculando área e materiais...",
  "Estimando faixa de preço...",
  "Montando seu orçamento...",
];

export default function Home() {
  const router = useRouter();
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [fraseIdx, setFraseIdx] = useState(0);
  const [exemploIdx, setExemploIdx] = useState(0);
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    if (!enviando) return;
    const interval = setInterval(() => {
      setFraseIdx((i) => (i + 1) % FRASES_PENSANDO.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [enviando]);

  useEffect(() => {
    if (!enviando) return;
    const id = setInterval(() => {
      setProgresso((p) => (p >= 75 ? p : Math.min(75, p + (75 - p) * 0.1)));
    }, 300);
    return () => clearInterval(id);
  }, [enviando]);

  const [exemploVisivel, setExemploVisivel] = useState(true);

  useEffect(() => {
    const FADE_MS = 400;
    const interval = setInterval(() => {
      setExemploVisivel(false);
      setTimeout(() => {
        setExemploIdx((i) => (i + 1) % EXEMPLOS.length);
        setExemploVisivel(true);
      }, FADE_MS);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function aoEnviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const texto = descricao.trim();
    if (texto.length < 10) {
      toast.error("Descreva o serviço com pelo menos 10 caracteres.");
      return;
    }

    setFraseIdx(0);
    setProgresso(8);
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
      setProgresso(100);
      salvarOrcamento({ descricao: texto, dados });
      await new Promise((r) => setTimeout(r, 400));
      router.push("/revisao");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Não foi possível processar a descrição."
      );
      setEnviando(false);
      setProgresso(0);
    }
  }


  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl">
          <section className="mb-10 text-center">
            <BadgeIA />
            <h2 className="mt-5 font-extrabold leading-tight tracking-tight text-white text-3xl sm:text-4xl">
              Orçamentos profissionais
              <br />
              <span className="text-brand-400">em segundos</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Descreva o serviço com suas palavras e a IA monta o orçamento,
              calcula o valor e gera o resultado.
            </p>
          </section>

          <form
            onSubmit={aoEnviar}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur sm:p-6"
          >
            <div className="mb-3">
              <label
                htmlFor="descricao"
                className="flex items-center gap-2 text-sm font-semibold text-white"
              >
                Descreva o serviço
              </label>
            </div>

            <textarea
              id="descricao"
              name="descricao"
              rows={10}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Preciso pintar uma casa de 70 metros, com massa corrida em dois quartos, tinta premium, em 3 dias."
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20"
              disabled={enviando}
            />

            <button
              type="submit"
              disabled={enviando}
              aria-live="polite"
              className="mt-4 relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-400 px-5 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-brand-400/20 transition hover:bg-brand-300 disabled:cursor-not-allowed"
            >
              {enviando && (
                <div
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-white/15 transition-[width] duration-700 ease-out"
                  style={{ width: `${progresso}%` }}
                />
              )}
              <span className="relative flex items-center gap-2">
                {enviando ? (
                  <div className="flex items-center gap-2 fade-in animate-pulse slide-in-from-bottom-1 duration-300">
                    <Loader2Icon className="h-4 w-4 shrink-0 animate-spin" />
                    <span key={fraseIdx}>{FRASES_PENSANDO[fraseIdx]}</span>
                  </div>
                ) : (
                  <>
                    Começar meu orçamento agora
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
                  </>
                )}
              </span>
            </button>

            <div className="mt-6 border-t border-zinc-800 pt-5">
              <p className="mb-3 text-xs font-medium text-zinc-400">
                Exemplo rápido:
              </p>
              <button
                type="button"
                onClick={() => setDescricao(EXEMPLOS[exemploIdx])}
                disabled={enviando}
                className="block w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2.5 text-left text-xs leading-relaxed text-zinc-300 transition-colors hover:border-brand-400/40 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  className={
                    "block min-h-[2lh] transition-opacity duration-[400ms] ease-in-out max-[424px]:min-h-[3lh] " +
                    (exemploVisivel ? "opacity-100" : "opacity-0")
                  }
                >
                  {EXEMPLOS[exemploIdx]}
                </span>
              </button>
            </div>
          </form>

          <section className="mt-8 grid grid-cols-3 gap-3">
            {PASSOS.map((passo) => (
              <div
                key={passo.numero}
                className="flex flex-col items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-4"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-400 text-sm font-bold text-zinc-950">
                  {passo.numero}
                </span>
                <span className="text-xs font-semibold text-white">
                  {passo.titulo}
                </span>
              </div>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
