"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { limparOrcamento } from "@/lib/storage";

const formatadorBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const ITENS_MOCK = [
  {
    titulo: "Tinta acrílica premium",
    descricao: "3 latas de 18L",
    valor: 450,
  },
  {
    titulo: "Mão de obra",
    descricao: "2 pintores por 3 dias",
    valor: 1800,
  },
  {
    titulo: "Materiais (rolos, pincéis, fitas)",
    descricao: "Kit completo",
    valor: 250,
  },
  {
    titulo: "Preparação de superfície",
    descricao: "30m²",
    valor: 300,
  },
];

const TOTAL_MOCK = 750;

export default function OrcamentoPage() {
  const router = useRouter();

  useEffect(() => {
    toast.success("Orçamento gerado com sucesso!", { id: "orcamento-gerado" });
  }, []);

  function novoOrcamento() {
    limparOrcamento();
    router.push("/");
  }

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-xl">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-400 text-zinc-950">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </span>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white">
                  Orçamento Estimado
                </h2>
                <p className="mt-0.5 text-sm text-zinc-400">
                  Valores baseados na descrição fornecida
                </p>
              </div>
            </div>

            <div className="my-5 border-t border-zinc-800" />

            <ul className="space-y-3">
              {ITENS_MOCK.map((item) => (
                <li
                  key={item.titulo}
                  className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">
                      {item.titulo}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {item.descricao}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-brand-400/10 px-3 py-1.5 text-sm font-bold text-brand-300 tabular-nums">
                    {formatadorBRL.format(item.valor)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="my-5 border-t border-zinc-800" />

            <div className="relative overflow-hidden rounded-xl bg-brand-400 p-5 text-zinc-950">
              <div className="relative z-10">
                <p className="text-xs font-medium opacity-80">Total Estimado</p>
                <p className="mt-1 text-3xl font-extrabold tabular-nums">
                  {formatadorBRL.format(TOTAL_MOCK)}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="absolute right-4 top-1/2 h-12 w-12 -translate-y-1/2 opacity-70"
                aria-hidden
              >
                <path d="M12 2 14.09 8.26 20.5 9 15.5 13.5 17 20 12 16.77 7 20l1.5-6.5L3.5 9l6.41-.74L12 2z" />
              </svg>
            </div>

            <p className="mt-5 text-center text-xs text-zinc-400">
              Este é um orçamento estimado. Os valores podem variar conforme
              as condições reais do serviço.
            </p>

            <button
              type="button"
              onClick={novoOrcamento}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
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
              Criar novo orçamento
            </button>
          </section>
        </div>
      </main>
    </>
  );
}
