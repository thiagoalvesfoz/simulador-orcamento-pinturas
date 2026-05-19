import { extrairComGemini } from "./extract-ai-gemini";
import { extrairComOpenAI } from "./extract-ai-openai";
import type { DadosExtraidos } from "./types";

export type AiProvider = "gemini" | "openai";

const SYSTEM_PROMPT = `Você analisa descrições de serviços de pintura e retorna um array de itens de serviço.

Retorne TODOS os serviços distintos mencionados (ex: paredes + teto + porta = 3 itens).

Tipos de serviço — e qual campo "quantidade" representa:
- pintura_parede: parede interna (repintura simples ou pintura completa) — quantidade em m²
- pintura_teto: teto (simples ou com massa corrida) — quantidade em m²
- pintura_externa: fachada, muro, parede externa, qualquer superfície ao ar livre — quantidade em m²
- textura: grafiato, textura rolada, textura projetada — quantidade em m²
- efeito_decorativo: marmorização, cimento queimado, efeito veludo, linho, aço corten — quantidade em m²
- pintura_grade: grade e estrutura metálica — quantidade em m²
- pintura_telhado: telhado (lavagem + pintura ou tratamento) — quantidade em m²
- pintura_piso: piso, calçada, paver, epóxi, demarcação — quantidade em m²
- pintura_porta_janela: porta ou janela — quantidade em UNIDADES (número de peças, não m²)
- pintura_portao: portão — quantidade em UNIDADES (número de portões)

Complexidade (por item):
- baixa: repintura simples, superfície em bom estado
- media: serviço padrão (use quando não houver pista clara)
- alta: massa corrida, lixamento completo, preparação extensa
- premium: acabamento artístico, alto padrão, múltiplas etapas

Fatores adicionais por item (inclua apenas se claramente mencionados para aquele item):
- altura_alta: superfície acima de 3m, pé direito alto, andaime necessário
- ambiente_externo: exposto a intempérie além do normal (não usar quando tipo já é pintura_externa)
- acesso_dificil: acesso difícil, área confinada, escada especial
- parede_ruim: trincas, infiltração, mofo, reparos extensos

Se a área não for mencionada, estime razoavelmente a partir do contexto.`;

export function detectarProvider(): AiProvider | null {
  const explicito = process.env.AI_PROVIDER?.toLowerCase();
  if (explicito === "gemini" || explicito === "openai") {
    return explicito;
  }
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
}

export async function extrairComIA(
  descricao: string
): Promise<DadosExtraidos> {
  const provider = detectarProvider();
  if (!provider) {
    throw new Error(
      "Nenhum provedor de IA configurado (defina GEMINI_API_KEY ou OPENAI_API_KEY)."
    );
  }

  if (provider === "gemini") {
    return extrairComGemini(descricao, SYSTEM_PROMPT);
  }
  return extrairComOpenAI(descricao, SYSTEM_PROMPT);
}
