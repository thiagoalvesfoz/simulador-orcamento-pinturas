import { NextResponse } from "next/server";
import { detectarProvider, extrairComIA } from "@/lib/extract-ai";
import { extrairHeuristico } from "@/lib/extract";
import { calcularOrcamento, calcularSubtotalItem } from "@/lib/pricing";
import { UNIDADE_POR_TIPO } from "@/lib/types";
import type { DadosExtraidos, DadosOrcamento, ItemOrcamento } from "@/lib/types";

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
  const dados = extraidoParaOrcamento(extraido);

  return NextResponse.json(dados);
}

async function extrair(descricao: string): Promise<DadosExtraidos> {
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

function extraidoParaOrcamento(extraido: DadosExtraidos): DadosOrcamento {
  const itens: ItemOrcamento[] = extraido.itens.map((item, i) => {
    const { subtotal, explicacao } = calcularSubtotalItem(item);
    return {
      id: `item-${i}-${Math.random().toString(36).slice(2, 7)}`,
      tipo: item.tipo,
      unidade: UNIDADE_POR_TIPO[item.tipo],
      quantidade: item.quantidade,
      complexidade: item.complexidade,
      fatores: item.fatores,
      subtotal,
      serviceBandId:     item.serviceBandId     ?? undefined,
      estado_superficie: item.estado_superficie ?? undefined,
      patologias:        item.patologias        ?? undefined,
      preparacoes:       item.preparacoes       ?? undefined,
      ocupacao:          item.ocupacao          ?? undefined,
      explicacao,
    };
  });

  const faixa = calcularOrcamento(itens);
  return {
    itens,
    ...faixa,
    valor_final: Math.round((faixa.faixa_preco_min + faixa.faixa_preco_max) / 2),
  };
}
