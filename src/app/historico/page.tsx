import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { orcamentos } from "@/lib/db/schema";
import { and, eq, desc, ilike } from "drizzle-orm";
import Header from "@/components/Header";
import OrcamentoCard from "./OrcamentoCard";
import { Suspense } from "react";
import FiltroCliente from "./FiltroCliente";

export const runtime = "nodejs";


export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/historico");

  const { q } = await searchParams;
  const busca = q?.trim();

  const filtro = busca
    ? and(
        eq(orcamentos.profileId, user.id),
        eq(orcamentos.status, "finalizado"),
        ilike(orcamentos.nomeCliente, `%${busca}%`)
      )
    : and(eq(orcamentos.profileId, user.id), eq(orcamentos.status, "finalizado"));

  const lista = await db
    .select()
    .from(orcamentos)
    .where(filtro)
    .orderBy(desc(orcamentos.createdAt));

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                Histórico
              </h2>
              <p className="mt-0.5 text-sm text-zinc-400">
                {lista.length === 0 && busca
                  ? `Nenhum resultado para "${busca}".`
                  : lista.length === 0
                  ? "Nenhum orçamento gerado ainda."
                  : `${lista.length} orçamento${lista.length > 1 ? "s" : ""} gerado${lista.length > 1 ? "s" : ""}`}
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-brand-300"
            >
              <PlusIcon className="h-4 w-4" />
              Novo
            </Link>
          </div>

          <Suspense>
            <FiltroCliente />
          </Suspense>

          {lista.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center">
              <p className="mb-4 text-zinc-400">
                {busca
                  ? `Nenhum orçamento encontrado para "${busca}".`
                  : "Seus orçamentos aparecerão aqui depois que você gerar o primeiro PDF."}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-brand-300"
              >
                <PlusIcon className="h-4 w-4" />
                Criar primeiro orçamento
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {lista.map((orc) => {
                const dados = orc.dados as { itens?: unknown[] } | null;
                const nItens = Array.isArray(dados?.itens) ? dados.itens.length : 0;
                return (
                  <li key={orc.id}>
                    <OrcamentoCard
                      id={orc.id}
                      numero={orc.numero}
                      nomeCliente={orc.nomeCliente}
                      descricao={orc.descricao}
                      dados={orc.dados}
                      observacoes={orc.observacoes}
                      valorFinal={orc.valorFinal}
                      createdAt={orc.createdAt}
                      nItens={nItens}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
