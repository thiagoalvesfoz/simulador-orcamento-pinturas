export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="mx-auto w-full max-w-xl px-4 pt-6 pb-4 sm:pt-8">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            PINTOR
          </h1>
        </div>
        <div className="mt-1 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-zinc-700" />
          <span className="text-xs font-bold tracking-[0.3em] text-cyan-400">
            PRO IA
          </span>
          <span className="h-px w-10 bg-zinc-700" />
        </div>
      </div>
    </header>
  );
}
