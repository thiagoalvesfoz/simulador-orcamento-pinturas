import { extrairComGemini } from "./extract-ai-gemini";
import { extrairComOpenAI } from "./extract-ai-openai";
import type { DadosExtraidos } from "./types";

export type AiProvider = "gemini" | "openai";

const SYSTEM_PROMPT = `Você analisa descrições de serviços de pintura e extrai dados estruturados.

Tipos de serviço:
- pintura_simples: pintura interna ou externa comum
- preparacao_superficie: massa corrida, lixamento, reparos
- pintura_decorativa: grafiato, textura, efeitos
- acabamento_especial: marmorização, cimento queimado, alto padrão

Complexidade:
- baixa: parede em bom estado
- media: serviço padrão (use quando não houver pista clara)
- alta: detalhes ou dificuldade adicional
- premium: acabamento artístico ou alto padrão

Fatores adicionais (inclua apenas se mencionados):
- altura_alta: paredes acima de 3m, pé direito alto
- ambiente_externo: fachada ou área externa
- acesso_dificil: necessidade de escada ou andaime
- parede_ruim: trincas, infiltração, mofo, reparos extensos

Se a área não for mencionada, estime um valor razoável a partir do contexto.`;

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
