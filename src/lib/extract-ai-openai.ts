import OpenAI from "openai";
import {
  COMPLEXIDADES,
  FATORES,
  TIPOS_SERVICO,
  type DadosExtraidos,
} from "./types";

const SCHEMA = {
  name: "DadosOrcamento",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      tipo: { type: "string", enum: [...TIPOS_SERVICO] },
      area_m2: { type: "number", minimum: 1 },
      complexidade: { type: "string", enum: [...COMPLEXIDADES] },
      fatores: {
        type: "array",
        items: { type: "string", enum: [...FATORES] },
      },
    },
    required: ["tipo", "area_m2", "complexidade", "fatores"],
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
