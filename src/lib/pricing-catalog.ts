import type { ServiceBandId, TipoServico } from "./types";

export type PricingBand = {
  id: ServiceBandId;
  label: string;
  unidade: "m2" | "un";
  min: number;
  max: number;
  categoria: "parede" | "teto" | "fachada" | "textura" | "metal" | "telhado" | "piso" | "porta" | "portao";
  inclui: string[];
  quandoUsar: string;
};

export const PRICING_CATALOG: PricingBand[] = [
  // ── Paredes internas ──────────────────────────────────────────────────────
  {
    id: "pintura_simples_interna",
    label: "Repintura simples interna",
    unidade: "m2",
    min: 20,
    max: 30,
    categoria: "parede",
    inclui: ["1-2 demãos de tinta", "preparo mínimo"],
    quandoUsar: "Repintura sobre tinta em bom estado, sem preparo de superfície",
  },
  {
    id: "pintura_completa_interna",
    label: "Pintura completa interna",
    unidade: "m2",
    min: 30,
    max: 50,
    categoria: "parede",
    inclui: ["selador ou fundo preparador", "2 demãos de tinta", "preparo básico"],
    quandoUsar: "Primeira pintura ou repintura com preparo; parede em estado regular",
  },
  {
    id: "pintura_alto_padrao",
    label: "Pintura alto padrão",
    unidade: "m2",
    min: 45,
    max: 70,
    categoria: "parede",
    inclui: ["massa corrida", "lixamento", "tinta premium", "2-3 demãos"],
    quandoUsar: "Acabamento fino, tinta de primeira linha, superfície exige preparo completo",
  },
  // ── Teto ──────────────────────────────────────────────────────────────────
  {
    id: "teto_simples",
    label: "Pintura de teto simples",
    unidade: "m2",
    min: 20,
    max: 30,
    categoria: "teto",
    inclui: ["1-2 demãos", "preparo mínimo"],
    quandoUsar: "Teto em bom estado, repintura ou primeira demão",
  },
  {
    id: "teto_completo",
    label: "Pintura de teto completa",
    unidade: "m2",
    min: 28,
    max: 45,
    categoria: "teto",
    inclui: ["selador", "2 demãos", "emassamento pontual"],
    quandoUsar: "Teto com manchas, umidade pontual ou preparo necessário",
  },
  // ── Fachada / externa ─────────────────────────────────────────────────────
  {
    id: "fachada_simples",
    label: "Fachada / muro simples",
    unidade: "m2",
    min: 25,
    max: 40,
    categoria: "fachada",
    inclui: ["tinta para ambientes externos", "preparo básico"],
    quandoUsar: "Muro ou fachada simples, tinta sólida, sem texturas",
  },
  {
    id: "fachada_completa",
    label: "Fachada completa",
    unidade: "m2",
    min: 35,
    max: 65,
    categoria: "fachada",
    inclui: ["limpeza", "selador externo", "2-3 demãos", "reparos pontuais"],
    quandoUsar: "Fachada com desgaste, trincas leves, necessidade de tratamento",
  },
  // ── Texturas e efeitos ────────────────────────────────────────────────────
  {
    id: "textura_rolada",
    label: "Textura rolada",
    unidade: "m2",
    min: 30,
    max: 50,
    categoria: "textura",
    inclui: ["aplicação de textura", "acabamento com rolo"],
    quandoUsar: "Textura simples aplicada com rolo; fachadas e muros",
  },
  {
    id: "textura_projetada",
    label: "Textura projetada / grafiato",
    unidade: "m2",
    min: 50,
    max: 90,
    categoria: "textura",
    inclui: ["projeção mecânica", "acabamento artístico", "grafiato ou salpicado"],
    quandoUsar: "Textura projetada, grafiato; exige mão de obra especializada",
  },
  {
    id: "cimento_queimado",
    label: "Cimento queimado",
    unidade: "m2",
    min: 70,
    max: 120,
    categoria: "textura",
    inclui: ["base cimentícia", "queima", "selamento final"],
    quandoUsar: "Efeito decorativo de cimento queimado em piso ou parede",
  },
  {
    id: "marmorizacao_simples",
    label: "Marmorização simples",
    unidade: "m2",
    min: 100,
    max: 180,
    categoria: "textura",
    inclui: ["fundo preparado", "efeito marmorizado", "verniz de acabamento"],
    quandoUsar: "Efeito mármore em paredes; técnica de nível intermediário",
  },
  {
    id: "marmorizacao_premium",
    label: "Marmorização premium",
    unidade: "m2",
    min: 180,
    max: 350,
    categoria: "textura",
    inclui: ["preparo completo", "efeito marmorizado de alta precisão", "verniz premium"],
    quandoUsar: "Marmorização artística de alto padrão; pintor especializado",
  },
  {
    id: "efeito_veludo",
    label: "Efeito veludo / aveludado",
    unidade: "m2",
    min: 80,
    max: 150,
    categoria: "textura",
    inclui: ["tinta especial aveludada", "técnica de aplicação específica"],
    quandoUsar: "Efeito veludo em paredes internas; toque acetinado",
  },
  {
    id: "efeito_linho",
    label: "Efeito linho / tecido",
    unidade: "m2",
    min: 80,
    max: 140,
    categoria: "textura",
    inclui: ["tinta especial", "efeito de textura de tecido"],
    quandoUsar: "Efeito visual de tecido na parede",
  },
  // ── Metal ────────────────────────────────────────────────────────────────
  {
    id: "grade_m2",
    label: "Grade e estrutura metálica",
    unidade: "m2",
    min: 40,
    max: 80,
    categoria: "metal",
    inclui: ["lixamento", "tinta esmalte ou anticorrosivo", "1-2 demãos"],
    quandoUsar: "Grades, escadas metálicas, estruturas de ferro; preço por m²",
  },
  // ── Telhado ───────────────────────────────────────────────────────────────
  {
    id: "telhado_simples",
    label: "Pintura de telhado simples",
    unidade: "m2",
    min: 25,
    max: 45,
    categoria: "telhado",
    inclui: ["tinta para telhado", "aplicação sem tratamento especial"],
    quandoUsar: "Telhado em estado razoável, pintura de manutenção",
  },
  {
    id: "telhado_tratamento",
    label: "Telhado com tratamento",
    unidade: "m2",
    min: 35,
    max: 60,
    categoria: "telhado",
    inclui: ["limpeza", "impermeabilizante", "tinta elastomérica", "reparos"],
    quandoUsar: "Telhado com infiltrações ou desgaste; tratamento antes da tinta",
  },
  // ── Piso ──────────────────────────────────────────────────────────────────
  {
    id: "piso_calcada",
    label: "Piso / calçada",
    unidade: "m2",
    min: 15,
    max: 25,
    categoria: "piso",
    inclui: ["tinta para piso ou calçada", "1-2 demãos"],
    quandoUsar: "Calçadas, pisos simples de cimento, áreas externas",
  },
  {
    id: "piso_epoxi",
    label: "Piso epóxi",
    unidade: "m2",
    min: 40,
    max: 90,
    categoria: "piso",
    inclui: ["preparo do concreto", "tinta epóxi", "acabamento brilhoso ou acetinado"],
    quandoUsar: "Garagens, galpões, áreas industriais; piso de alto desempenho",
  },
  {
    id: "piso_demarcacao",
    label: "Demarcação de piso",
    unidade: "m2",
    min: 20,
    max: 40,
    categoria: "piso",
    inclui: ["fita ou tinta de demarcação", "linhas e símbolos"],
    quandoUsar: "Estacionamentos, galpões industriais; faixas e sinalização no piso",
  },
  // ── Portas e janelas ──────────────────────────────────────────────────────
  {
    id: "porta_lisa",
    label: "Porta",
    unidade: "un",
    min: 150,
    max: 300,
    categoria: "porta",
    inclui: ["lixamento", "selador", "esmalte ou tinta acrílica", "ferragens protegidas"],
    quandoUsar: "Portas lisas de madeira ou MDF; preço por unidade",
  },
  {
    id: "janela",
    label: "Janela",
    unidade: "un",
    min: 120,
    max: 300,
    categoria: "porta",
    inclui: ["lixamento", "esmalte", "proteção de vidro e ferragem"],
    quandoUsar: "Janelas de madeira; preço por unidade",
  },
  // ── Portões ───────────────────────────────────────────────────────────────
  {
    id: "portao_pequeno",
    label: "Portão pequeno",
    unidade: "un",
    min: 250,
    max: 600,
    categoria: "portao",
    inclui: ["lixamento", "fundo anticorrosivo", "esmalte sintético", "2 demãos"],
    quandoUsar: "Portão pedestre ou de grades pequeno; até aprox. 2 m²",
  },
  {
    id: "portao_medio",
    label: "Portão médio",
    unidade: "un",
    min: 600,
    max: 1500,
    categoria: "portao",
    inclui: ["lixamento", "fundo anticorrosivo", "esmalte sintético", "2 demãos"],
    quandoUsar: "Portão de garagem simples; aprox. 2 a 6 m²",
  },
  {
    id: "portao_grande",
    label: "Portão grande",
    unidade: "un",
    min: 1500,
    max: 4000,
    categoria: "portao",
    inclui: ["lixamento completo", "tratamento de ferrugem", "fundo anticorrosivo", "esmalte premium"],
    quandoUsar: "Portão industrial ou residencial grande; acima de 6 m²",
  },
];

export const CATALOG_BY_ID = Object.fromEntries(
  PRICING_CATALOG.map((b) => [b.id, b])
) as Record<ServiceBandId, PricingBand>;

export const TIPO_TO_DEFAULT_BAND: Record<TipoServico, ServiceBandId> = {
  pintura_parede:       "pintura_completa_interna",
  pintura_teto:         "teto_simples",
  pintura_externa:      "fachada_simples",
  textura:              "textura_rolada",
  efeito_decorativo:    "cimento_queimado",
  pintura_grade:        "grade_m2",
  pintura_telhado:      "telhado_simples",
  pintura_piso:         "piso_calcada",
  pintura_porta_janela: "porta_lisa",
  pintura_portao:       "portao_medio",
};

export function getBand(tipo: TipoServico, serviceBandId?: ServiceBandId): PricingBand {
  const id = serviceBandId ?? TIPO_TO_DEFAULT_BAND[tipo];
  return CATALOG_BY_ID[id];
}
