import { UNIDADE_POR_TIPO } from "./types";
import type {
  Complexidade,
  DadosExtraidos,
  EstadoSuperficie,
  Fator,
  Patologia,
  Preparacao,
  ServiceBandId,
  TipoServico,
} from "./types";

export function extrairHeuristico(descricao: string): DadosExtraidos {
  const texto = descricao.toLowerCase();
  const tipo = detectarTipo(texto);
  const unidade = UNIDADE_POR_TIPO[tipo];
  const patologias = detectarPatologias(texto);
  const preparacoes = detectarPreparacoes(texto);
  const estado = inferirEstado(patologias, preparacoes);
  return {
    itens: [
      {
        tipo,
        quantidade:    detectarQuantidade(texto, unidade),
        complexidade:  detectarComplexidade(texto),
        fatores:       detectarFatoresExecucao(texto),
        serviceBandId: detectarBandId(tipo, texto),
        estado_superficie: estado,
        patologias,
        preparacoes,
        ocupacao: detectarOcupacao(texto),
      },
    ],
  };
}

function detectarTipo(texto: string): TipoServico {
  if (/marmoriz|cimento queimado|veludo|linho|a[cç]o corten/.test(texto)) return "efeito_decorativo";
  if (/grafiato|textura|projetad/.test(texto)) return "textura";
  if (/port[aã]o/.test(texto)) return "pintura_portao";
  if (/grade|estrutura met[aá]lic|esmalte sint[eé]tico/.test(texto)) return "pintura_grade";
  if (/telhado/.test(texto)) return "pintura_telhado";
  if (/\bpiso\b|cal[cç]ada|paver|ep[oó]xi|demarca[cç]/.test(texto)) return "pintura_piso";
  if (/\bporta\b|\bjanela\b/.test(texto)) return "pintura_porta_janela";
  if (/fachada|muro|[aá]rea externa|ao ar livre|parede externa/.test(texto)) return "pintura_externa";
  if (/\bteto\b/.test(texto)) return "pintura_teto";
  return "pintura_parede";
}

function detectarBandId(tipo: TipoServico, texto: string): ServiceBandId | undefined {
  switch (tipo) {
    case "pintura_parede":
      if (/massa corrida|lixamento|alto padr[aã]o|premium/.test(texto)) return "pintura_alto_padrao";
      if (/completa|preparo|selador|fundo preparador/.test(texto)) return "pintura_completa_interna";
      if (/repintura|simples|bom estado/.test(texto)) return "pintura_simples_interna";
      return undefined;
    case "pintura_teto":
      return /massa|emass|preparo|selador/.test(texto) ? "teto_completo" : "teto_simples";
    case "pintura_externa":
      return /trinca|infiltr|completa|desgaste/.test(texto) ? "fachada_completa" : "fachada_simples";
    case "textura":
      return /grafiato|projetad/.test(texto) ? "textura_projetada" : "textura_rolada";
    case "efeito_decorativo":
      if (/marmori.*premium|alto padr[aã]o.*marmori/.test(texto)) return "marmorizacao_premium";
      if (/marmori/.test(texto)) return "marmorizacao_simples";
      if (/veludo/.test(texto)) return "efeito_veludo";
      if (/linho/.test(texto)) return "efeito_linho";
      return "cimento_queimado";
    case "pintura_telhado":
      return /infiltr|imperme|tratamento|elastom[eé]r/.test(texto) ? "telhado_tratamento" : "telhado_simples";
    case "pintura_piso":
      return /ep[oó]xi/.test(texto) ? "piso_epoxi"
        : /demarca[cç]/.test(texto) ? "piso_demarcacao"
        : "piso_calcada";
    case "pintura_porta_janela":
      return /\bjanela\b/.test(texto) && !/\bporta\b/.test(texto) ? "janela" : "porta_lisa";
    case "pintura_portao":
      if (/grande|industrial|pesad/.test(texto)) return "portao_grande";
      if (/pequen|pedestr/.test(texto)) return "portao_pequeno";
      return "portao_medio";
    default:
      return undefined;
  }
}

function detectarQuantidade(texto: string, unidade: "m2" | "un"): number {
  if (unidade === "un") {
    const match = texto.match(/(\d+)\s*(?:porta|portão|portao|janela)/);
    return match ? parseInt(match[1]) : 1;
  }
  const match = texto.match(/(\d+(?:[.,]\d+)?)\s*(?:m2|m²|metros quadrados|metros)/i);
  if (match) {
    const valor = parseFloat(match[1].replace(",", "."));
    if (!isNaN(valor) && valor > 0) return valor;
  }
  return 30;
}

function detectarComplexidade(texto: string): Complexidade {
  if (/premium|alto padr[aã]o|luxo|art[ií]stic/.test(texto)) return "premium";
  if (/detalhad|complic|dif[ií]cil|complex/.test(texto)) return "alta";
  if (/em bom estado|simples|f[aá]cil|r[aá]pid/.test(texto)) return "baixa";
  return "media";
}

// Only execution-risk fatores; surface condition now goes to patologias/estado_superficie
function detectarFatoresExecucao(texto: string): Fator[] {
  const fatores: Fator[] = [];
  if (/altura|p[eé] direito alto|teto alto|acima de 3\s*m|>\s*3\s*m/.test(texto)) {
    fatores.push("altura_alta");
  }
  if (/escada|andaime|acesso dif[ií]cil|dif[ií]cil acesso/.test(texto)) {
    fatores.push("acesso_dificil");
  }
  return fatores;
}

function detectarPatologias(texto: string): Patologia[] {
  const result: Patologia[] = [];
  if (/trinca profunda|fissura|rachad/.test(texto))      result.push("trinca_profunda");
  else if (/trinca|fissura leve/.test(texto))            result.push("trinca_leve");
  if (/infiltra[cç][aã]o ativ/.test(texto))              result.push("infiltracao_ativa");
  else if (/infiltra[cç]/.test(texto))                   result.push("infiltracao_antiga");
  if (/mofo|bolor/.test(texto))                          result.push("mofo");
  if (/efloresc[eê]ncia|salitre/.test(texto))            result.push("eflorescencia");
  if (/marcas? de (adesivo|fita|esparadrapo)/.test(texto)) result.push("marcas_adesivo");
  if (/tinta descascando|descasca/.test(texto))          result.push("tinta_descascando");
  if (/ferrugem|enferrujad/.test(texto))                 result.push("ferrugem");
  return result;
}

function detectarPreparacoes(texto: string): Preparacao[] {
  const result: Preparacao[] = [];
  if (/massa corrida/.test(texto))                    result.push("massa_corrida");
  if (/lixamento|lixa/.test(texto))                   result.push("lixamento");
  if (/selador/.test(texto))                          result.push("selador");
  if (/fundo preparador/.test(texto))                 result.push("fundo_preparador");
  if (/imperme[aá]bil/.test(texto))                   result.push("impermeabilizante");
  if (/tratamento de mofo|anti-?mofo/.test(texto))    result.push("tratamento_mofo");
  if (/corre[cç][aã]o de trinca/.test(texto))         result.push("correcao_trinca");
  if (/tratamento de ferrugem|antifer/.test(texto))   result.push("tratamento_ferrugem");
  return result;
}

function inferirEstado(patologias: Patologia[], preparacoes: Preparacao[]): EstadoSuperficie | undefined {
  if (patologias.includes("infiltracao_ativa") || patologias.includes("trinca_profunda")) return "critica";
  if (patologias.length >= 2) return "ruim";
  if (patologias.length === 1 || preparacoes.includes("massa_corrida")) return "regular";
  if (preparacoes.length > 0) return "regular";
  return undefined;
}

function detectarOcupacao(texto: string) {
  if (/im[oó]vel vazio|apartamento vazio|casa vazia|desocupado/.test(texto)) return "vazio" as const;
  if (/mobiliado|m[oó]veis/.test(texto)) return "mobiliado" as const;
  return undefined;
}
