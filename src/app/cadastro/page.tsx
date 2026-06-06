"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [carregando, setCarregando] = useState(false);

  const supabase = createClient();

  async function aoCadastrar(e: React.FormEvent) {
    e.preventDefault();

    if (senha !== confirmar) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (senha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setCarregando(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: { nome }, // salvo em auth.users.raw_user_meta_data
        },
      });
      if (error) throw error;

      toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar conta.");
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4">
          <Image
            src="/logo-pintor-pro-ia.svg"
            alt="Pintor Pro IA"
            width={1040}
            height={360}
            priority
            className="h-9 w-auto"
          />
          <h1 className="text-xl font-bold text-white">Criar conta grátis</h1>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
          <form onSubmit={aoCadastrar} className="flex flex-col gap-4">
            <div>
              <label htmlFor="nome" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Seu nome
              </label>
              <input
                id="nome"
                type="text"
                autoComplete="name"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={carregando}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20 disabled:opacity-60"
                placeholder="João Silva"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-300">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={carregando}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20 disabled:opacity-60"
                placeholder="voce@email.com"
              />
            </div>

            <div>
              <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="new-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={carregando}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20 disabled:opacity-60"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirmar" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Confirmar senha
              </label>
              <input
                id="confirmar"
                type="password"
                autoComplete="new-password"
                required
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                disabled={carregando}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/20 disabled:opacity-60"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-400 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-brand-400/20 transition hover:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "Criar conta"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-zinc-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-brand-400 hover:text-brand-300">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
