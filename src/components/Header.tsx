import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="mx-auto flex w-full max-w-xl items-center justify-center px-4 py-4">
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
      </div>
    </header>
  );
}
