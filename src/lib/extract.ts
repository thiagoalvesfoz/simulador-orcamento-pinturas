import type { Complexidade, Fator, TipoServico } from "./types";

type DadosExtraidos = {
  tipo: TipoServico;
  area_m2: number;
  complexidade: Complexidade;
  fatores: Fator[];
};

export function extrairHeuristico(descricao: string): DadosExtraidos {
  const texto = descricao.toLowerCase();

  return {
    tipo: detectarTipo(texto),
    area_m2: detectarArea(texto),
    complexidade: detectarComplexidade(texto),
    fatores: detectarFatores(texto),
  };
}

function detectarTipo(texto: string): TipoServico {
  if (/marmoriz|cimento queimado|verniz especial|metalizad/.test(texto)) {
    return "acabamento_especial";
  }
  if (/grafiato|textura|efeito decorativo|estêncil|stencil/.test(texto)) {
    return "pintura_decorativa";
  }
  if (
    /massa corrida|lixament|lixar|reparo|preparo de superf|preparação de superf/.test(
      texto
    )
  ) {
    return "preparacao_superficie";
  }
  return "pintura_simples";
}

function detectarArea(texto: string): number {
  const padraoArea =
    /(\d+(?:[.,]\d+)?)\s*(?:m2|m²|metros quadrados|metros)/i;
  const match = texto.match(padraoArea);
  if (match) {
    const valor = Number.parseFloat(match[1].replace(",", "."));
    if (!Number.isNaN(valor) && valor > 0) {
      return valor;
    }
  }
  return 30;
}

function detectarComplexidade(texto: string): Complexidade {
  if (/premium|alto padr[aã]o|luxo|art[ií]stic/.test(texto)) {
    return "premium";
  }
  if (/detalhad|complic|dif[ií]cil|complex/.test(texto)) {
    return "alta";
  }
  if (/em bom estado|simples|f[aá]cil|r[aá]pid/.test(texto)) {
    return "baixa";
  }
  return "media";
}

function detectarFatores(texto: string): Fator[] {
  const fatores: Fator[] = [];

  if (
    /altura|p[eé] direito alto|teto alto|acima de 3 m|acima de 3m|>\s*3\s*m/.test(
      texto
    )
  ) {
    fatores.push("altura_alta");
  }
  if (/externa|fachada|ao ar livre|[aá]rea externa|do lado de fora/.test(texto)) {
    fatores.push("ambiente_externo");
  }
  if (/escada|andaime|acesso dif[ií]cil|dif[ií]cil acesso/.test(texto)) {
    fatores.push("acesso_dificil");
  }
  if (
    /parede ruim|parede danificad|trinca|infiltra[cç]|mofo|reparo extensiv|m[aá] condi/.test(
      texto
    )
  ) {
    fatores.push("parede_ruim");
  }

  return fatores;
}
