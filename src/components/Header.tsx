import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-4">
        <div className="w-8" />
        <h1>
          <Image
            src="/logo-pintor-pro-ia.svg"
            alt="Pintor Pro IA"
            width={1040}
            height={360}
            priority
            className="h-10 w-auto"
          />
        </h1>
        <Link
          href="/perfil"
          aria-label="Meu perfil"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
