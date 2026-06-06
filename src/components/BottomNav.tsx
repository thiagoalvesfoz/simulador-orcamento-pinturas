"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ClockIcon, PlusCircleIcon, UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TABS = [
  { href: "/historico", label: "Histórico", Icon: ClockIcon },
  { href: "/", label: "Novo", Icon: PlusCircleIcon, center: true },
  { href: "/perfil", label: "Perfil", Icon: UserIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLogado(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setLogado(!!s?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!logado) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/70">
      <div
        className="mx-auto flex w-full max-w-xl items-end justify-around px-2"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {TABS.map(({ href, label, Icon, center }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 pt-3 pb-1 text-xs font-medium transition ${
                center
                  ? active
                    ? "text-brand-400"
                    : "text-zinc-300 hover:text-white"
                  : active
                  ? "text-brand-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
