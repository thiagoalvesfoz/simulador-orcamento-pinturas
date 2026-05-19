export const TIPOS_SERVICO = [
  "pintura_parede",
  "pintura_teto",
  "pintura_externa",
  "textura",
  "efeito_decorativo",
  "pintura_grade",
  "pintura_telhado",
  "pintura_piso",
  "pintura_porta_janela",
  "pintura_portao",
] as const;

export type TipoServico = (typeof TIPOS_SERVICO)[number];

export const UNIDADE_POR_TIPO: Record<TipoServico, "m2" | "un"> = {
  pintura_parede:       "m2",
  pintura_teto:         "m2",
  pintura_externa:      "m2",
  textura:              "m2",
  efeito_decorativo:    "m2",
  pintura_grade:        "m2",
  pintura_telhado:      "m2",
  pintura_piso:         "m2",
  pintura_porta_janela: "un",
  pintura_portao:       "un",
};

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
  pintura_parede:       "Pintura de parede",
  pintura_teto:         "Pintura de teto",
  pintura_externa:      "Pintura externa / fachada",
  textura:              "Textura",
  efeito_decorativo:    "Efeito decorativo",
  pintura_grade:        "Grade e estrutura metálica",
  pintura_telhado:      "Telhado",
  pintura_piso:         "Piso e calçada",
  pintura_porta_janela: "Porta e janela",
  pintura_portao:       "Portão",
};

export const COMPLEXIDADES_LABEL: Record<Complexidade, string> = {
  baixa:   "Baixa",
  media:   "Média",
  alta:    "Alta",
  premium: "Premium",
};

export const FATORES_LABEL: Record<Fator, string> = {
  altura_alta:      "Altura > 3m",
  ambiente_externo: "Ambiente externo",
  acesso_dificil:   "Acesso difícil",
  parede_ruim:      "Parede em mau estado",
};

export type ItemOrcamento = {
  id: string;
  tipo: TipoServico;
  unidade: "m2" | "un";
  quantidade: number;
  complexidade: Complexidade;
  fatores: Fator[];
  subtotal: number;
};

export type DadosOrcamento = {
  itens: ItemOrcamento[];
  faixa_preco_min: number;
  faixa_preco_max: number;
  valor_final: number;
};

export type PerfilPintor = {
  nome: string;
  telefone: string;
  email: string;
  cidade: string;
  logo_base64?: string;
  condicoes: string[];
};

export type RascunhoOrcamento = {
  descricao: string;
  dados: DadosOrcamento;
  nome_cliente?: string;
  observacoes?: string;
  perfil?: PerfilPintor;
  numero_orcamento?: string;
};

export type ItemExtraido = {
  tipo: TipoServico;
  quantidade: number;
  complexidade: Complexidade;
  fatores: Fator[];
};

export type DadosExtraidos = {
  itens: ItemExtraido[];
};
