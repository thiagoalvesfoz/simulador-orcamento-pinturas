"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const subscribeNoop = () => () => {};
const obterSnapshotSuporte = () => obterConstrutor() !== null;
const obterSnapshotServer = (): boolean | null => null;

type SpeechRecognitionEventLike = {
  results: ArrayLike<{
    0: { transcript: string };
    isFinal: boolean;
  }>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult:
    | ((event: SpeechRecognitionEventLike) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function obterConstrutor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type Props = {
  onTranscricao: (texto: string) => void;
  desabilitado?: boolean;
  variant?: "default" | "icon";
};

export default function VozRecorder({
  onTranscricao,
  desabilitado,
  variant = "default",
}: Props) {
  const suportado = useSyncExternalStore(
    subscribeNoop,
    obterSnapshotSuporte,
    obterSnapshotServer
  );
  const [gravando, setGravando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function reportarErro(mensagem: string) {
    setErro(mensagem);
    if (variant === "icon") toast.error(mensagem);
  }

  function iniciar() {
    setErro(null);
    const Construtor = obterConstrutor();
    if (!Construtor) return;

    const recognition = new Construtor();
    recognition.lang = "pt-BR";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let texto = "";
      for (let i = 0; i < event.results.length; i++) {
        texto += event.results[i][0].transcript;
      }
      onTranscricao(texto.trim());
    };

    recognition.onerror = (event) => {
      const codigo = event.error;
      if (codigo === "aborted") {
        setGravando(false);
        return;
      }
      const mensagem =
        codigo === "not-allowed"
          ? "Permissão para usar o microfone foi negada."
          : codigo === "no-speech"
          ? "Nenhuma fala detectada."
          : codigo === "network"
          ? "Sem conexão para reconhecer voz."
          : `Erro ao gravar: ${codigo}`;
      reportarErro(mensagem);
      setGravando(false);
    };

    recognition.onend = () => {
      setGravando(false);
    };

    recognitionRef.current = recognition;
    setGravando(true);
    try {
      recognition.start();
    } catch {
      setGravando(false);
      reportarErro("Não foi possível iniciar o microfone.");
    }
  }

  function parar() {
    recognitionRef.current?.stop();
  }

  if (suportado === false) {
    if (variant === "icon") return null;
    return (
      <p className="text-xs text-zinc-500">
        Seu navegador não suporta entrada por voz. Use Chrome ou Edge.
      </p>
    );
  }

  if (variant === "icon") {
    const rotulo = gravando ? "Parar gravação" : "Usar microfone";
    return (
      <Tooltip>
        <TooltipTrigger
          type="button"
          onClick={gravando ? parar : iniciar}
          disabled={desabilitado || suportado === null}
          aria-label={rotulo}
          className={
            "relative inline-flex h-8 w-8 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 " +
            (gravando
              ? "bg-cyan-400 text-zinc-950"
              : "text-cyan-400 hover:bg-cyan-400/10")
          }
        >
          {gravando && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-cyan-400 opacity-75"
            />
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative h-4 w-4"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </TooltipTrigger>
        <TooltipContent>{rotulo}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={gravando ? parar : iniciar}
        disabled={desabilitado || suportado === null}
        className={
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 " +
          (gravando
            ? "border-red-500 bg-red-500 text-white hover:bg-red-600"
            : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500")
        }
      >
        <span
          className={
            "inline-block h-2 w-2 rounded-full " +
            (gravando ? "bg-white animate-pulse" : "bg-red-500")
          }
        />
        {gravando ? "Parar gravação" : "Gravar descrição"}
      </button>
      {erro && <p className="text-xs text-red-400">{erro}</p>}
    </div>
  );
}
