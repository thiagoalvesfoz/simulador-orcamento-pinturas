"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DownloadIcon, CopyIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

type OrcamentoCardProps = {
  id: string;
  numero: string;
  nomeCliente: string | null;
  descricao: string | null;
  dados: unknown;
  observacoes: string | null;
  valorFinal: string | null;
  createdAt: Date | string | null;
  nItens: number;
};

function formatarData(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatarValor(valor: string | number | null) {
  if (!valor) return "—";
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function OrcamentoCard({
  id,
  numero,
  nomeCliente,
  descricao,
  dados,
  observacoes,
  valorFinal,
  createdAt,
  nItens,
}: OrcamentoCardProps) {
  const router = useRouter();
  const [baixando, setBaixando] = useState(false);
  const [copiando, setCopiando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (modalAberto) dialog.showModal();
    else dialog.close();
  }, [modalAberto]);

  async function baixarPdf() {
    setBaixando(true);
    try {
      const perfilRes = await fetch("/api/perfil");
      const perfil = perfilRes.ok ? await perfilRes.json() : null;

      const res = await fetch("/api/gerar-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao,
          dados,
          nome_cliente: nomeCliente || undefined,
          observacoes: observacoes || undefined,
          numero_orcamento: numero || undefined,
          perfil: perfil
            ? {
                nome: perfil.nome,
                telefone: perfil.telefone,
                email: perfil.email,
                cidade: perfil.cidade,
                condicoes: perfil.condicoes,
              }
            : undefined,
        }),
      });

      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${numero || "orcamento"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao baixar PDF.");
    } finally {
      setBaixando(false);
    }
  }

  async function copiarOrcamento() {
    setCopiando(true);
    try {
      const res = await fetch("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao, dados }),
      });
      if (!res.ok) throw new Error();
      const { id: novoId } = await res.json();
      router.push(`/revisao?id=${novoId}`);
    } catch {
      toast.error("Erro ao copiar orçamento.");
      setCopiando(false);
    }
  }

  async function excluir() {
    setExcluindo(true);
    try {
      const res = await fetch(`/api/orcamentos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setModalAberto(false);
      router.refresh();
    } catch {
      toast.error("Erro ao excluir orçamento.");
      setExcluindo(false);
    }
  }

  const ocupado = baixando || copiando || excluindo;

  return (
    <>
      {/* Modal de confirmação */}
      <dialog
        ref={dialogRef}
        onCancel={() => setModalAberto(false)}
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-white backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <h3 className="text-base font-semibold">Excluir orçamento?</h3>
        <p className="mt-1 text-sm text-zinc-400">
          {nomeCliente
            ? `O orçamento de ${nomeCliente} será removido permanentemente.`
            : "Este orçamento será removido permanentemente."}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setModalAberto(false)}
            disabled={excluindo}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:text-white disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={excluir}
            disabled={excluindo}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
          >
            {excluindo && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
            Excluir
          </button>
        </div>
      </dialog>

      {/* Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-zinc-700">

        {/* Linha 1: número + data + lixo */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 font-mono text-xs font-semibold text-brand-400">{numero}</span>
            <span className="text-xs text-zinc-500">{formatarData(createdAt)}</span>
          </div>
          <button
            type="button"
            onClick={() => setModalAberto(true)}
            disabled={ocupado}
            className="shrink-0 rounded-lg p-1.5 text-zinc-600 transition hover:bg-rose-950/40 hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
            title="Excluir orçamento"
          >
            <Trash2Icon className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Linha 2: cliente + valor */}
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {nomeCliente ? (
              <p className="truncate text-base font-bold text-white">{nomeCliente}</p>
            ) : (
              <p className="text-sm italic text-zinc-500">Sem cliente</p>
            )}
            {descricao && (
              <p className="mt-0.5 truncate text-xs text-zinc-500">{descricao}</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold tabular-nums text-white">{formatarValor(valorFinal)}</p>
            <p className="text-xs text-zinc-600">{nItens} {nItens === 1 ? "item" : "itens"}</p>
          </div>
        </div>

        {/* Linha 3: ações */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={baixarPdf}
            disabled={ocupado}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-400/50 bg-brand-400/8 py-2.5 text-sm font-semibold text-brand-400 transition hover:border-brand-400 hover:bg-brand-400/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {baixando ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <DownloadIcon className="h-4 w-4" />
            )}
            Baixar PDF
          </button>
          <button
            type="button"
            onClick={copiarOrcamento}
            disabled={ocupado}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-400 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copiando ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
            Copiar
          </button>
        </div>
      </div>
    </>
  );
}
