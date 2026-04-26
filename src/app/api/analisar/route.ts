import { NextResponse } from "next/server";
import { detectarProvider, extrairComIA } from "@/lib/extract-ai";
import { extrairHeuristico } from "@/lib/extract";
import { calcularFaixaPreco } from "@/lib/pricing";
import type { DadosOrcamento } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { descricao?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const descricao =
    typeof body.descricao === "string" ? body.descricao.trim() : "";
  if (descricao.length < 10) {
    return NextResponse.json(
      { erro: "Descrição muito curta." },
      { status: 400 }
    );
  }

  const extraido = await extrair(descricao);
  const faixa = calcularFaixaPreco(extraido);

  const dados: DadosOrcamento = {
    ...extraido,
    ...faixa,
    valor_final: Math.round((faixa.faixa_preco_min + faixa.faixa_preco_max) / 2),
  };

  return NextResponse.json(dados);
}

async function extrair(descricao: string) {
  if (!detectarProvider()) {
    return extrairHeuristico(descricao);
  }
  try {
    return await extrairComIA(descricao);
  } catch (err) {
    console.error("Falha na extração via IA, usando heurística:", err);
    return extrairHeuristico(descricao);
  }
}
