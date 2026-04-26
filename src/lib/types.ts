export const TIPOS_SERVICO = [
  "pintura_simples",
  "preparacao_superficie",
  "pintura_decorativa",
  "acabamento_especial",
] as const;

export type TipoServico = (typeof TIPOS_SERVICO)[number];

export const COMPLEXIDADES = ["baixa", "media", "alta", "premium"] as const;

export type Complexidade = (typeof COMPLEXIDADES)[number];

export const FATORES = [
  "altura_alta",
  "ambiente_externo",
  "acesso_dificil",
  "parede_ruim",
] as const;

export type Fator = (typeof FATORES)[number];

export const TIPOS_SERVICO_LABEL: Record<TipoServico, string> = {
  pintura_simples: "Pintura simples",
  preparacao_superficie: "Preparação de superfície",
  pintura_decorativa: "Pintura decorativa",
  acabamento_especial: "Acabamento especial",
};

export const COMPLEXIDADES_LABEL: Record<Complexidade, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  premium: "Premium",
};

export const FATORES_LABEL: Record<Fator, string> = {
  altura_alta: "Altura > 3m",
  ambiente_externo: "Ambiente externo",
  acesso_dificil: "Acesso difícil",
  parede_ruim: "Parede em mau estado",
};

export type DadosOrcamento = {
  tipo: TipoServico;
  area_m2: number;
  complexidade: Complexidade;
  fatores: Fator[];
  faixa_preco_min: number;
  faixa_preco_max: number;
  valor_final: number;
};

export type RascunhoOrcamento = {
  descricao: string;
  dados: DadosOrcamento;
};

export type DadosExtraidos = {
  tipo: TipoServico;
  area_m2: number;
  complexidade: Complexidade;
  fatores: Fator[];
};
