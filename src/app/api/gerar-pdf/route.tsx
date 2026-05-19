import { renderToBuffer } from "@react-pdf/renderer";
import { OrcamentoPdf } from "@/lib/pdf-document";
import {
  COMPLEXIDADES,
  FATORES,
  TIPOS_SERVICO,
  UNIDADE_POR_TIPO,
  type Complexidade,
  type Fator,
  type ItemOrcamento,
  type PerfilPintor,
  type RascunhoOrcamento,
  type TipoServico,
} from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("JSON inválido.", 400);
  }

  const rascunho = validarRascunho(body);
  if (!rascunho) {
    return jsonError("Dados de orçamento inválidos.", 400);
  }

  const buffer = await renderToBuffer(<OrcamentoPdf rascunho={rascunho} />);

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="orcamento.pdf"',
      "Cache-Control": "no-store",
    },
  });
}

function jsonError(mensagem: string, status: number) {
  return new Response(JSON.stringify({ erro: mensagem }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function validarRascunho(input: unknown): RascunhoOrcamento | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  if (typeof obj.descricao !== "string" || obj.descricao.trim().length < 1) {
    return null;
  }
  const dados = obj.dados;
  if (!dados || typeof dados !== "object") return null;
  const d = dados as Record<string, unknown>;

  if (!Array.isArray(d.itens) || d.itens.length === 0) return null;
  const itens = d.itens.map(validarItem).filter((i): i is ItemOrcamento => i !== null);
  if (itens.length === 0) return null;
  if (typeof d.faixa_preco_min !== "number") return null;
  if (typeof d.faixa_preco_max !== "number") return null;
  if (typeof d.valor_final !== "number") return null;

  return {
    descricao: obj.descricao,
    dados: {
      itens,
      faixa_preco_min: d.faixa_preco_min,
      faixa_preco_max: d.faixa_preco_max,
      valor_final: d.valor_final,
    },
    nome_cliente:
      typeof obj.nome_cliente === "string" ? obj.nome_cliente : undefined,
    observacoes:
      typeof obj.observacoes === "string" && obj.observacoes.trim()
        ? obj.observacoes.trim()
        : undefined,
    perfil: validarPerfil(obj.perfil),
    numero_orcamento:
      typeof obj.numero_orcamento === "string" && obj.numero_orcamento.trim()
        ? obj.numero_orcamento.trim()
        : undefined,
  };
}

function validarItem(input: unknown): ItemOrcamento | null {
  if (!input || typeof input !== "object") return null;
  const i = input as Record<string, unknown>;
  if (!isTipo(i.tipo)) return null;
  if (typeof i.quantidade !== "number" || i.quantidade <= 0) return null;
  if (!isComplexidade(i.complexidade)) return null;
  if (!Array.isArray(i.fatores) || !i.fatores.every(isFator)) return null;
  return {
    id: typeof i.id === "string" ? i.id : `item-${Math.random().toString(36).slice(2, 7)}`,
    tipo: i.tipo,
    unidade: UNIDADE_POR_TIPO[i.tipo],
    quantidade: i.quantidade,
    complexidade: i.complexidade,
    fatores: i.fatores,
    subtotal: typeof i.subtotal === "number" ? i.subtotal : 0,
  };
}

function validarPerfil(input: unknown): PerfilPintor | undefined {
  if (!input || typeof input !== "object") return undefined;
  const p = input as Record<string, unknown>;
  const condicoes = Array.isArray(p.condicoes)
    ? p.condicoes.filter(
        (c): c is string => typeof c === "string" && c.trim().length > 0
      )
    : [];
  return {
    nome: typeof p.nome === "string" ? p.nome : "",
    telefone: typeof p.telefone === "string" ? p.telefone : "",
    email: typeof p.email === "string" ? p.email : "",
    cidade: typeof p.cidade === "string" ? p.cidade : "",
    logo_base64:
      typeof p.logo_base64 === "string" ? p.logo_base64 : undefined,
    condicoes,
  };
}

function isTipo(v: unknown): v is TipoServico {
  return (
    typeof v === "string" && (TIPOS_SERVICO as readonly string[]).includes(v)
  );
}

function isComplexidade(v: unknown): v is Complexidade {
  return (
    typeof v === "string" && (COMPLEXIDADES as readonly string[]).includes(v)
  );
}

function isFator(v: unknown): v is Fator {
  return typeof v === "string" && (FATORES as readonly string[]).includes(v);
}
