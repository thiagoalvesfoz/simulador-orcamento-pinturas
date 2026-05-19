import type {
  Complexidade,
  EstadoSuperficie,
  FatorExplicado,
  Fator,
  Ocupacao,
  Patologia,
  Preparacao,
  PricingExplicacao,
  ServiceBandId,
  TipoServico,
} from "./types";
import {
  COMPLEXIDADES_LABEL,
  ESTADOS_SUPERFICIE_LABEL,
  FATORES_LABEL,
  OCUPACOES_LABEL,
  PATOLOGIAS_LABEL,
  PREPARACOES_LABEL,
} from "./types";
import { getBand } from "./pricing-catalog";

const POSICAO_COMPLEXIDADE: Record<Complexidade, number> = {
  baixa:   0.20,
  media:   0.50,
  alta:    0.70,
  premium: 0.90,
};

const SCORE_FATOR: Partial<Record<Fator, number>> = {
  parede_ruim:      0.20,
  ambiente_externo: 0.05,
};

const SCORE_ESTADO_SUPERFICIE: Record<EstadoSuperficie, number> = {
  excelente: -0.15,
  boa:        0.00,
  regular:   +0.10,
  ruim:      +0.25,
  critica:   +0.40,
};

const SCORE_PATOLOGIA: Partial<Record<Patologia, number>> = {
  trinca_leve:        +0.05,
  trinca_profunda:    +0.15,
  infiltracao_antiga: +0.15,
  infiltracao_ativa:  +0.30,
  mofo:               +0.15,
  eflorescencia:      +0.10,
  marcas_adesivo:     +0.05,
  tinta_descascando:  +0.10,
  ferrugem:           +0.20,
};

const SCORE_PREPARACAO: Partial<Record<Preparacao, number>> = {
  massa_corrida:        +0.10,
  lixamento:            +0.05,
  selador:              +0.03,
  fundo_preparador:     +0.03,
  impermeabilizante:    +0.15,
  tratamento_mofo:      +0.10,
  correcao_trinca:      +0.10,
  tratamento_ferrugem:  +0.15,
};

const SCORE_OCUPACAO: Record<Ocupacao, number> = {
  vazio:                  -0.10,
  parcialmente_mobiliado: +0.05,
  mobiliado:              +0.20,
};

const CAP_PATOLOGIAS  = 0.30;
const CAP_PREPARACOES = 0.25;

const MULTIPLICADOR_ESPECIAL: Partial<Record<Fator, number>> = {
  altura_alta:    1.30,
  acesso_dificil: 1.20,
};
const MULTIPLICADOR_ESPECIAL_MAX = 1.50;

type EntradaItem = {
  tipo: TipoServico;
  quantidade: number;
  complexidade: Complexidade;
  fatores: Fator[];
  serviceBandId?: ServiceBandId;
  estado_superficie?: EstadoSuperficie | null;
  patologias?: Patologia[] | null;
  preparacoes?: Preparacao[] | null;
  ocupacao?: Ocupacao | null;
};

export function calcularSubtotalItem(item: EntradaItem): {
  subtotal: number;
  min: number;
  max: number;
  explicacao: PricingExplicacao;
} {
  const band = getBand(item.tipo, item.serviceBandId ?? undefined);
  const qty = Math.max(item.quantidade, 1);
  const aplicados: FatorExplicado[] = [];
  const alertas: string[] = [];

  // 1. Baseline from complexidade
  const posBase = POSICAO_COMPLEXIDADE[item.complexidade];
  aplicados.push({
    id: `complexidade_${item.complexidade}`,
    label: COMPLEXIDADES_LABEL[item.complexidade],
    grupo: "complexidade",
    scoreAdj: posBase,
  });

  // 2. Fase 3 rich context presence disables old parede_ruim to avoid double-count
  const hasRichContext =
    item.estado_superficie != null || (item.patologias?.length ?? 0) > 0;

  let scoreOldFatores = 0;
  for (const f of item.fatores) {
    const adj = SCORE_FATOR[f];
    if (adj == null) continue;
    // skip parede_ruim when rich context available; keep ambiente_externo always
    if (f === "parede_ruim" && hasRichContext) continue;
    scoreOldFatores += adj;
    aplicados.push({ id: f, label: FATORES_LABEL[f], grupo: "legado", scoreAdj: adj });
  }

  // 3. Estado superfície
  const scoreEstado =
    item.estado_superficie != null
      ? SCORE_ESTADO_SUPERFICIE[item.estado_superficie]
      : 0;
  if (item.estado_superficie != null) {
    aplicados.push({
      id: `estado_${item.estado_superficie}`,
      label: ESTADOS_SUPERFICIE_LABEL[item.estado_superficie],
      grupo: "estado_superficie",
      scoreAdj: scoreEstado,
    });
  }

  // 4. Patologias (group cap)
  const rawPat = (item.patologias ?? []).reduce(
    (acc, p) => acc + (SCORE_PATOLOGIA[p] ?? 0),
    0
  );
  const scorePatologias = Math.min(rawPat, CAP_PATOLOGIAS);
  for (const p of item.patologias ?? []) {
    aplicados.push({
      id: p,
      label: PATOLOGIAS_LABEL[p],
      grupo: "patologia",
      scoreAdj: SCORE_PATOLOGIA[p] ?? 0,
    });
  }

  // 5. Preparações (group cap)
  const rawPrep = (item.preparacoes ?? []).reduce(
    (acc, p) => acc + (SCORE_PREPARACAO[p] ?? 0),
    0
  );
  const scorePreparacoes = Math.min(rawPrep, CAP_PREPARACOES);
  for (const p of item.preparacoes ?? []) {
    aplicados.push({
      id: p,
      label: PREPARACOES_LABEL[p],
      grupo: "preparacao",
      scoreAdj: SCORE_PREPARACAO[p] ?? 0,
    });
  }

  // 6. Ocupação
  const scoreOcupacao =
    item.ocupacao != null ? SCORE_OCUPACAO[item.ocupacao] : 0;
  if (item.ocupacao != null) {
    aplicados.push({
      id: item.ocupacao,
      label: OCUPACOES_LABEL[item.ocupacao],
      grupo: "ocupacao",
      scoreAdj: scoreOcupacao,
    });
  }

  // 7. Final position
  const posicaoFinal = Math.min(
    Math.max(
      posBase +
        scoreOldFatores +
        scoreEstado +
        scorePatologias +
        scorePreparacoes +
        scoreOcupacao,
      0
    ),
    1
  );

  // 8. Interpolated unit price
  const precoUnidade = band.min + posicaoFinal * (band.max - band.min);

  // 9. Execution-risk multipliers
  let multRaw = 1.0;
  for (const f of item.fatores) {
    const m = MULTIPLICADOR_ESPECIAL[f];
    if (!m) continue;
    multRaw *= m;
    aplicados.push({
      id: f,
      label: FATORES_LABEL[f],
      grupo: "multiplicador_especial",
      multiplicador: m,
    });
  }
  const multEspecial = Math.min(multRaw, MULTIPLICADOR_ESPECIAL_MAX);

  // 10. Alertas
  if (item.patologias?.includes("infiltracao_ativa")) {
    alertas.push("Infiltração ativa detectada — recomendamos vistoria antes de fechar o orçamento.");
  }
  if (item.estado_superficie === "critica") {
    alertas.push("Estado crítico da superfície — vistoria técnica recomendada.");
  }
  if (item.patologias?.includes("trinca_profunda")) {
    alertas.push("Trinca profunda detectada — pode indicar problema estrutural. Avalie antes de pintar.");
  }

  const explicacao: PricingExplicacao = {
    bandId:          band.id,
    bandLabel:       band.label,
    bandMin:         band.min,
    bandMax:         band.max,
    posicaoBase:     posBase,
    posicaoFinal,
    precoUnidade:    Math.round(precoUnidade * 100) / 100,
    multEspecial,
    fatoresAplicados: aplicados,
    alertas,
  };

  return {
    subtotal: Math.round(precoUnidade * qty * multEspecial),
    min:      Math.round(band.min * qty),
    max:      Math.round(band.max * qty * MULTIPLICADOR_ESPECIAL_MAX),
    explicacao,
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
