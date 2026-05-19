import { GoogleGenAI, Type } from "@google/genai";
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

// Only execution-risk fatores remain in the schema (parede_ruim/ambiente_externo replaced by rich fields)
const FATORES_EXECUCAO = FATORES.filter(
  (f) => f === "altura_alta" || f === "acesso_dificil"
);

const ITEM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    tipo:             { type: Type.STRING, enum: [...TIPOS_SERVICO] },
    quantidade:       { type: Type.NUMBER },
    complexidade:     { type: Type.STRING, enum: [...COMPLEXIDADES] },
    fatores: {
      type:  Type.ARRAY,
      items: { type: Type.STRING, enum: [...FATORES_EXECUCAO] },
    },
    serviceBandId:    { type: Type.STRING, enum: [...SERVICE_BAND_IDS], nullable: true },
    estado_superficie:{ type: Type.STRING, enum: [...ESTADOS_SUPERFICIE], nullable: true },
    patologias: {
      type:  Type.ARRAY,
      items: { type: Type.STRING, enum: [...PATOLOGIAS] },
      nullable: true,
    },
    preparacoes: {
      type:  Type.ARRAY,
      items: { type: Type.STRING, enum: [...PREPARACOES] },
      nullable: true,
    },
    ocupacao: { type: Type.STRING, enum: [...OCUPACOES], nullable: true },
  },
  required: ["tipo", "quantidade", "complexidade", "fatores"],
  propertyOrdering: [
    "tipo", "quantidade", "complexidade", "fatores",
    "serviceBandId", "estado_superficie", "patologias", "preparacoes", "ocupacao",
  ],
};

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    itens: { type: Type.ARRAY, items: ITEM_SCHEMA },
  },
  required: ["itens"],
};

export async function extrairComGemini(
  descricao: string,
  systemPrompt: string
): Promise<DadosExtraidos> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const modelo = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey });

  const resposta = await ai.models.generateContent({
    model: modelo,
    contents: descricao,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const texto = resposta.text;
  if (!texto) {
    throw new Error("Resposta vazia do Gemini.");
  }

  return JSON.parse(texto) as DadosExtraidos;
}
