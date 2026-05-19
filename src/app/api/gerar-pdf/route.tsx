import { renderToBuffer } from "@react-pdf/renderer";
import { OrcamentoPdf } from "@/lib/pdf-document";
import {
  COMPLEXIDADES,
  FATORES,
  TIPOS_SERVICO,
  type Complexidade,
  type Fator,
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

  if (!isTipo(d.tipo)) return null;
  if (typeof d.area_m2 !== "number" || d.area_m2 <= 0) return null;
  if (!isComplexidade(d.complexidade)) return null;
  if (!Array.isArray(d.fatores) || !d.fatores.every(isFator)) return null;
  if (typeof d.faixa_preco_min !== "number") return null;
  if (typeof d.faixa_preco_max !== "number") return null;
  if (typeof d.valor_final !== "number") return null;

  return {
    descricao: obj.descricao,
    dados: {
      tipo: d.tipo,
      area_m2: d.area_m2,
      complexidade: d.complexidade,
      fatores: d.fatores,
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
    validade_dias:
      typeof obj.validade_dias === "number" && obj.validade_dias > 0
        ? obj.validade_dias
        : undefined,
    perfil: validarPerfil(obj.perfil),
  };
}

function validarPerfil(input: unknown): PerfilPintor | undefined {
  if (!input || typeof input !== "object") return undefined;
  const p = input as Record<string, unknown>;
  return {
    nome: typeof p.nome === "string" ? p.nome : "",
    telefone: typeof p.telefone === "string" ? p.telefone : "",
    email: typeof p.email === "string" ? p.email : "",
    cidade: typeof p.cidade === "string" ? p.cidade : "",
    logo_base64:
      typeof p.logo_base64 === "string" ? p.logo_base64 : undefined,
    prazo_dias: typeof p.prazo_dias === "number" ? p.prazo_dias : 15,
    entrada_percentual:
      typeof p.entrada_percentual === "number" ? p.entrada_percentual : 20,
    validade_dias: typeof p.validade_dias === "number" ? p.validade_dias : 20,
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
