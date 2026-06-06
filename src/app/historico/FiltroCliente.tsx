"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";

export default function FiltroCliente() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [valor, setValor] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (valor.trim()) {
        params.set("q", valor.trim());
      } else {
        params.delete("q");
      }
      router.replace(`/historico?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [valor, router, searchParams]);

  return (
    <div className="relative mb-4">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input
        type="text"
        placeholder="Buscar por nome do cliente..."
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-9 pr-9 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20"
      />
      {valor && (
        <button
          type="button"
          onClick={() => setValor("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
