import type {
  Complexidade,
  DadosOrcamento,
  Fator,
  TipoServico,
} from "./types";

const PRECO_BASE_M2: Record<TipoServico, number> = {
  pintura_simples: 25,
  preparacao_superficie: 18,
  pintura_decorativa: 90,
  acabamento_especial: 250,
};

const MULTIPLICADOR_COMPLEXIDADE: Record<Complexidade, number> = {
  baixa: 0.85,
  media: 1.0,
  alta: 1.25,
  premium: 1.6,
};

const ACRESCIMO_FATOR: Record<Fator, number> = {
  altura_alta: 0.15,
  ambiente_externo: 0.1,
  acesso_dificil: 0.2,
  parede_ruim: 0.25,
};

const VARIACAO_FAIXA = 0.15;

type EntradaCalculo = Pick<
  DadosOrcamento,
  "tipo" | "area_m2" | "complexidade" | "fatores"
>;

export function calcularFaixaPreco(entrada: EntradaCalculo): {
  faixa_preco_min: number;
  faixa_preco_max: number;
} {
  const base = PRECO_BASE_M2[entrada.tipo];
  const multComplex = MULTIPLICADOR_COMPLEXIDADE[entrada.complexidade];
  const acrescimoFatores = entrada.fatores.reduce(
    (acc, f) => acc + ACRESCIMO_FATOR[f],
    0
  );

  const valorEstimado =
    base * Math.max(entrada.area_m2, 1) * multComplex * (1 + acrescimoFatores);

  const min = Math.round(valorEstimado * (1 - VARIACAO_FAIXA));
  const max = Math.round(valorEstimado * (1 + VARIACAO_FAIXA));

  return { faixa_preco_min: min, faixa_preco_max: max };
}
