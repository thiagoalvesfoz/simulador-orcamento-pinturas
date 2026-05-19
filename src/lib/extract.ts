import { UNIDADE_POR_TIPO } from "./types";
import type { Complexidade, DadosExtraidos, Fator, TipoServico } from "./types";

export function extrairHeuristico(descricao: string): DadosExtraidos {
  const texto = descricao.toLowerCase();
  const tipo = detectarTipo(texto);
  const unidade = UNIDADE_POR_TIPO[tipo];
  return {
    itens: [
      {
        tipo,
        quantidade: detectarQuantidade(texto, unidade),
        complexidade: detectarComplexidade(texto),
        fatores: detectarFatores(texto),
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

function detectarFatores(texto: string): Fator[] {
  const fatores: Fator[] = [];
  if (/altura|p[eé] direito alto|teto alto|acima de 3 m|acima de 3m|>\s*3\s*m/.test(texto)) {
    fatores.push("altura_alta");
  }
  if (/garagem aberta|[aá]rea descoberta|sem cobertura|exposto/.test(texto)) {
    fatores.push("ambiente_externo");
  }
  if (/escada|andaime|acesso dif[ií]cil|dif[ií]cil acesso/.test(texto)) {
    fatores.push("acesso_dificil");
  }
  if (/parede ruim|parede danificad|trinca|infiltra[cç]|mofo|reparo extensiv|m[aá] condi/.test(texto)) {
    fatores.push("parede_ruim");
  }
  return fatores;
}
