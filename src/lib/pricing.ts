import type { Complexidade, Fator, ItemExtraido, ItemOrcamento, TipoServico } from "./types";

const PRECO_BASE: Record<TipoServico, number> = {
  pintura_parede:        35,  // repintura R$20-30 (baixa) → alto padrão R$45-70 (premium)
  pintura_teto:          28,  // simples R$20-30 → completa R$30-45
  pintura_externa:       40,  // simples R$25-40 → fachada completa R$35-65
  textura:               55,  // rolada R$30-50 → projetada R$50-90
  efeito_decorativo:    140,  // cimento queimado R$70-120 → marmorização premium R$180-350
  pintura_grade:         60,  // grade R$40-80/m²
  pintura_telhado:       40,  // simples R$25-45 → com tratamento R$35-60
  pintura_piso:          35,  // calçada R$15-25 → epóxi R$40-90
  pintura_porta_janela: 180,  // porta lisa R$150-300/un, janela R$120-300/un
  pintura_portao:       700,  // pequeno R$250-600, médio R$600-1500, grande R$1500-4000
};

const MULTIPLICADOR_COMPLEXIDADE: Record<Complexidade, number> = {
  baixa:   0.85,
  media:   1.0,
  alta:    1.25,
  premium: 1.6,
};

const ACRESCIMO_FATOR: Record<Fator, number> = {
  altura_alta:      0.30,  // tabela: +20% a +40%
  ambiente_externo: 0.10,
  acesso_dificil:   0.20,
  parede_ruim:      0.25,
};

const VARIACAO_FAIXA = 0.15;

type EntradaItem = Pick<ItemExtraido | ItemOrcamento, "tipo" | "quantidade" | "complexidade" | "fatores">;

export function calcularSubtotalItem(item: EntradaItem): {
  subtotal: number;
  min: number;
  max: number;
} {
  const base = PRECO_BASE[item.tipo];
  const mult = MULTIPLICADOR_COMPLEXIDADE[item.complexidade];
  const acrescimo = item.fatores.reduce((acc, f) => acc + ACRESCIMO_FATOR[f], 0);
  const estimado = base * Math.max(item.quantidade, 1) * mult * (1 + acrescimo);
  return {
    subtotal: Math.round(estimado),
    min:      Math.round(estimado * (1 - VARIACAO_FAIXA)),
    max:      Math.round(estimado * (1 + VARIACAO_FAIXA)),
  };
}

export function calcularOrcamento(itens: EntradaItem[]): {
  faixa_preco_min: number;
  faixa_preco_max: number;
} {
  const totals = itens.map(calcularSubtotalItem);
  return {
    faixa_preco_min: totals.reduce((s, t) => s + t.min, 0),
    faixa_preco_max: totals.reduce((s, t) => s + t.max, 0),
  };
}
