"use client";

import { useEffect, useRef, useState } from "react";

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
};

export default function VozRecorder({ onTranscricao, desabilitado }: Props) {
  const [suportado, setSuportado] = useState<boolean | null>(null);
  const [gravando, setGravando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef("");

  useEffect(() => {
    setSuportado(obterConstrutor() !== null);
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function iniciar() {
    setErro(null);
    const Construtor = obterConstrutor();
    if (!Construtor) {
      setSuportado(false);
      return;
    }

    finalRef.current = "";
    const recognition = new Construtor();
    recognition.lang = "pt-BR";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const resultado = event.results[i];
        if (resultado.isFinal) {
          finalRef.current += resultado[0].transcript;
        } else {
          interim += resultado[0].transcript;
        }
      }
      onTranscricao((finalRef.current + interim).trim());
    };

    recognition.onerror = (event) => {
      const codigo = event.error;
      const mensagem =
        codigo === "not-allowed"
          ? "Permissão para usar o microfone foi negada."
          : codigo === "no-speech"
          ? "Nenhuma fala detectada."
          : `Erro ao gravar: ${codigo}`;
      setErro(mensagem);
      setGravando(false);
    };

    recognition.onend = () => {
      setGravando(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setGravando(true);
  }

  function parar() {
    recognitionRef.current?.stop();
  }

  if (suportado === false) {
    return (
      <p className="text-xs text-zinc-500">
        Seu navegador não suporta entrada por voz. Use Chrome ou Edge.
      </p>
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
            : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300")
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
      {erro && <p className="text-xs text-red-600 dark:text-red-400">{erro}</p>}
    </div>
  );
}
