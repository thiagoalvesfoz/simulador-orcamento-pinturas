import OpenAI from "openai";
import {
  COMPLEXIDADES,
  ESTADOS_SUPERFICIE,
  FATORES,
  OCUPACOES,
  PATOLOGIAS,
  PREPARACOES,
  SERVICE_BAND_IDS,
  TIPOS_SERVICO,
  type DadosExtraidos,
} from "./types";

// Only execution-risk fatores remain (parede_ruim/ambiente_externo replaced by rich fields)
const FATORES_EXECUCAO = FATORES.filter(
  (f) => f === "altura_alta" || f === "acesso_dificil"
) as string[];

// OpenAI strict mode: all properties must be in required; nullable via anyOf
const ITEM_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    tipo:         { type: "string", enum: [...TIPOS_SERVICO] },
    quantidade:   { type: "number", minimum: 1 },
    complexidade: { type: "string", enum: [...COMPLEXIDADES] },
    fatores: {
      type:  "array",
      items: { type: "string", enum: FATORES_EXECUCAO },
    },
    serviceBandId: {
      anyOf: [{ type: "string", enum: [...SERVICE_BAND_IDS] }, { type: "null" }],
    },
    estado_superficie: {
      anyOf: [{ type: "string", enum: [...ESTADOS_SUPERFICIE] }, { type: "null" }],
    },
    patologias: {
      anyOf: [
        { type: "array", items: { type: "string", enum: [...PATOLOGIAS] } },
        { type: "null" },
      ],
    },
    preparacoes: {
      anyOf: [
        { type: "array", items: { type: "string", enum: [...PREPARACOES] } },
        { type: "null" },
      ],
    },
    ocupacao: {
      anyOf: [{ type: "string", enum: [...OCUPACOES] }, { type: "null" }],
    },
  },
  required: [
    "tipo", "quantidade", "complexidade", "fatores",
    "serviceBandId", "estado_superficie", "patologias", "preparacoes", "ocupacao",
  ],
} as const;

const SCHEMA = {
  name: "DadosOrcamento",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      itens: { type: "array", items: ITEM_SCHEMA },
    },
    required: ["itens"],
  },
} as const;

export async function extrairComOpenAI(
  descricao: string,
  systemPrompt: string
): Promise<DadosExtraidos> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const modelo = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const client = new OpenAI({ apiKey });

  const resposta = await client.chat.completions.create({
    model: modelo,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: descricao },
    ],
    response_format: {
      type: "json_schema",
      json_schema: SCHEMA,
    },
  });

  const conteudo = resposta.choices[0]?.message.content;
  if (!conteudo) {
    throw new Error("Resposta vazia do OpenAI.");
  }

  return JSON.parse(conteudo) as DadosExtraidos;
}
