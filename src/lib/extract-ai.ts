import { extrairComGemini } from "./extract-ai-gemini";
import { extrairComOpenAI } from "./extract-ai-openai";
import type { DadosExtraidos } from "./types";

export type AiProvider = "gemini" | "openai";

const SYSTEM_PROMPT = `Você analisa descrições de serviços de pintura e retorna um JSON com todos os itens distintos.

Retorne TODOS os serviços distintos mencionados (ex: paredes + teto + porta = 3 itens).

── TIPOS E UNIDADES ──
- pintura_parede: parede interna — quantidade em m²
- pintura_teto: teto — quantidade em m²
- pintura_externa: fachada, muro, parede externa — quantidade em m²
- textura: grafiato, textura rolada ou projetada — quantidade em m²
- efeito_decorativo: marmorização, cimento queimado, veludo, linho, aço corten — quantidade em m²
- pintura_grade: grade e estrutura metálica — quantidade em m²
- pintura_telhado: telhado — quantidade em m²
- pintura_piso: piso, calçada, paver, epóxi, demarcação — quantidade em m²
- pintura_porta_janela: porta ou janela — quantidade em UNIDADES (não m²)
- pintura_portao: portão — quantidade em UNIDADES

── BANDA DE PREÇO (serviceBandId) ──
Escolha a banda mais específica. Use null se não houver pista suficiente.
  Parede: pintura_simples_interna | pintura_completa_interna | pintura_alto_padrao
  Teto: teto_simples | teto_completo
  Fachada: fachada_simples | fachada_completa
  Textura/efeito: textura_rolada | textura_projetada | cimento_queimado | marmorizacao_simples | marmorizacao_premium | efeito_veludo | efeito_linho
  Metal: grade_m2
  Telhado: telhado_simples | telhado_tratamento
  Piso: piso_calcada | piso_epoxi | piso_demarcacao
  Porta/janela: porta_lisa | janela
  Portão: portao_pequeno | portao_medio | portao_grande

── COMPLEXIDADE (fine-tuning dentro da banda) ──
- baixa: repintura muito simples, sem preparo
- media: serviço padrão (use quando não houver pista clara)
- alta: com preparo, mais capricho, bom acabamento
- premium: acabamento artístico, alto padrão, múltiplas etapas

── FATORES DE EXECUÇÃO (somente os dois abaixo) ──
- altura_alta: superfície acima de 3 m ou andaime necessário
- acesso_dificil: acesso difícil, área confinada, escada especial
Não use parede_ruim nem ambiente_externo — use estado_superficie e patologias.

── ESTADO DA SUPERFÍCIE ──
Escolha um: excelente | boa | regular | ruim | critica
Use null se não houver informação suficiente.

── PATOLOGIAS (lista dos problemas visíveis) ──
Inclua apenas os claramente mencionados ou inferidos:
trinca_leve | trinca_profunda | infiltracao_antiga | infiltracao_ativa |
mofo | eflorescencia | marcas_adesivo | tinta_descascando | ferrugem
Use [] se nenhum.

── PREPARAÇÕES NECESSÁRIAS ──
Inclua apenas as mencionadas ou claramente necessárias:
massa_corrida | lixamento | selador | fundo_preparador |
impermeabilizante | tratamento_mofo | correcao_trinca | tratamento_ferrugem
Use [] se nenhuma.

── OCUPAÇÃO DO IMÓVEL ──
vazio | parcialmente_mobiliado | mobiliado
Use null se não mencionado.

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
