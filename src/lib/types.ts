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

export const SERVICE_BAND_IDS = [
  "pintura_simples_interna",
  "pintura_completa_interna",
  "pintura_alto_padrao",
  "teto_simples",
  "teto_completo",
  "fachada_simples",
  "fachada_completa",
  "textura_rolada",
  "textura_projetada",
  "cimento_queimado",
  "marmorizacao_simples",
  "marmorizacao_premium",
  "efeito_veludo",
  "efeito_linho",
  "grade_m2",
  "telhado_simples",
  "telhado_tratamento",
  "piso_calcada",
  "piso_epoxi",
  "piso_demarcacao",
  "porta_lisa",
  "janela",
  "portao_pequeno",
  "portao_medio",
  "portao_grande",
] as const;

export type ServiceBandId = (typeof SERVICE_BAND_IDS)[number];

export const SERVICE_BAND_LABELS: Record<ServiceBandId, string> = {
  pintura_simples_interna:  "Repintura simples interna",
  pintura_completa_interna: "Pintura completa interna",
  pintura_alto_padrao:      "Pintura alto padrão",
  teto_simples:             "Teto simples",
  teto_completo:            "Teto completo",
  fachada_simples:          "Fachada / muro simples",
  fachada_completa:         "Fachada completa",
  textura_rolada:           "Textura rolada",
  textura_projetada:        "Textura projetada / grafiato",
  cimento_queimado:         "Cimento queimado",
  marmorizacao_simples:     "Marmorização simples",
  marmorizacao_premium:     "Marmorização premium",
  efeito_veludo:            "Efeito veludo",
  efeito_linho:             "Efeito linho",
  grade_m2:                 "Grade / estrutura metálica",
  telhado_simples:          "Telhado simples",
  telhado_tratamento:       "Telhado com tratamento",
  piso_calcada:             "Piso / calçada",
  piso_epoxi:               "Piso epóxi",
  piso_demarcacao:          "Demarcação de piso",
  porta_lisa:               "Porta / janela",
  janela:                   "Janela",
  portao_pequeno:           "Portão pequeno",
  portao_medio:             "Portão médio",
  portao_grande:            "Portão grande",
};

// ── Fase 3: contrato rico de extração ────────────────────────────────────

export const ESTADOS_SUPERFICIE = ["excelente", "boa", "regular", "ruim", "critica"] as const;
export type EstadoSuperficie = (typeof ESTADOS_SUPERFICIE)[number];
export const ESTADOS_SUPERFICIE_LABEL: Record<EstadoSuperficie, string> = {
  excelente: "Excelente",
  boa:       "Boa",
  regular:   "Regular",
  ruim:      "Ruim",
  critica:   "Crítica",
};

export const PATOLOGIAS = [
  "trinca_leve",
  "trinca_profunda",
  "infiltracao_antiga",
  "infiltracao_ativa",
  "mofo",
  "eflorescencia",
  "marcas_adesivo",
  "tinta_descascando",
  "ferrugem",
] as const;
export type Patologia = (typeof PATOLOGIAS)[number];
export const PATOLOGIAS_LABEL: Record<Patologia, string> = {
  trinca_leve:        "Trinca leve",
  trinca_profunda:    "Trinca profunda",
  infiltracao_antiga: "Infiltração (antiga/resolvida)",
  infiltracao_ativa:  "Infiltração ativa",
  mofo:               "Mofo",
  eflorescencia:      "Eflorescência / salitre",
  marcas_adesivo:     "Marcas de adesivo / fita",
  tinta_descascando:  "Tinta descascando",
  ferrugem:           "Ferrugem",
};

export const PREPARACOES = [
  "massa_corrida",
  "lixamento",
  "selador",
  "fundo_preparador",
  "impermeabilizante",
  "tratamento_mofo",
  "correcao_trinca",
  "tratamento_ferrugem",
] as const;
export type Preparacao = (typeof PREPARACOES)[number];
export const PREPARACOES_LABEL: Record<Preparacao, string> = {
  massa_corrida:        "Massa corrida",
  lixamento:            "Lixamento",
  selador:              "Selador",
  fundo_preparador:     "Fundo preparador",
  impermeabilizante:    "Impermeabilizante",
  tratamento_mofo:      "Tratamento de mofo",
  correcao_trinca:      "Correção de trinca",
  tratamento_ferrugem:  "Tratamento de ferrugem",
};

export const OCUPACOES = ["vazio", "parcialmente_mobiliado", "mobiliado"] as const;
export type Ocupacao = (typeof OCUPACOES)[number];
export const OCUPACOES_LABEL: Record<Ocupacao, string> = {
  vazio:                  "Imóvel vazio",
  parcialmente_mobiliado: "Parcialmente mobiliado",
  mobiliado:              "Imóvel mobiliado",
};

// ── Fase 4: explicabilidade do cálculo ───────────────────────────────────

export type FatorExplicado = {
  id: string;
  label: string;
  grupo: "complexidade" | "estado_superficie" | "patologia" | "preparacao" | "ocupacao" | "legado" | "multiplicador_especial";
  scoreAdj?: number;
  multiplicador?: number;
};

export type PricingExplicacao = {
  bandId: ServiceBandId;
  bandLabel: string;
  bandMin: number;
  bandMax: number;
  posicaoBase: number;
  posicaoFinal: number;
  precoUnidade: number;
  multEspecial: number;
  fatoresAplicados: FatorExplicado[];
  alertas: string[];
};

// ─────────────────────────────────────────────────────────────────────────────

export type ItemOrcamento = {
  id: string;
  tipo: TipoServico;
  unidade: "m2" | "un";
  quantidade: number;
  complexidade: Complexidade;
  fatores: Fator[];
  subtotal: number;
  serviceBandId?: ServiceBandId;
  estado_superficie?: EstadoSuperficie;
  patologias?: Patologia[];
  preparacoes?: Preparacao[];
  ocupacao?: Ocupacao;
  explicacao?: PricingExplicacao;
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
  serviceBandId?: ServiceBandId;
  estado_superficie?: EstadoSuperficie;
  patologias?: Patologia[];
  preparacoes?: Preparacao[];
  ocupacao?: Ocupacao;
};

export type DadosExtraidos = {
  itens: ItemExtraido[];
};
