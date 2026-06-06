"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { LogInIcon, LogOutIcon } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function aoSair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-4">
        <div className="w-8" />

        <h1>
          <Link href="/">
            <Image
              src="/logo-pintor-pro-ia.svg"
              alt="Pintor Pro IA"
              width={1040}
              height={360}
              priority
              className="h-10 w-auto"
            />
          </Link>
        </h1>

        <div className="w-8 flex justify-end">
          {user ? (
            <button
              type="button"
              onClick={aoSair}
              aria-label="Sair"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              <LogOutIcon className="h-5 w-5" />
            </button>
          ) : (
            <Link
              href="/login"
              aria-label="Entrar"
              className="flex h-8 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              <LogInIcon className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
