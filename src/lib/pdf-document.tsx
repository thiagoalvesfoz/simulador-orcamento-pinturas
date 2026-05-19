import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  COMPLEXIDADES_LABEL,
  FATORES_LABEL,
  TIPOS_SERVICO_LABEL,
  type RascunhoOrcamento,
} from "./types";

// Pintor Pro IA palette
const C = {
  black:       "#000000",
  sheetBg:     "#0a0a0a",
  sheetElev:   "#131316",
  primary:     "#00B8E6",
  primaryInk:  "#001218",
  white:       "#ffffff",
  zinc100:     "#f4f4f5",
  zinc200:     "#e4e4e7",
  zinc300:     "#d4d4d8",
  zinc400:     "#a1a1aa",
  zinc500:     "#71717a",
  zinc600:     "#52525b",
  zinc900:     "#18181b",
  divider:     "#27272a",
  textMuted:   "rgba(255,255,255,0.55)",
  textDim:     "rgba(255,255,255,0.40)",
  textBody:    "rgba(255,255,255,0.85)",
  termItem:    "rgba(255,255,255,0.70)",
  invLabel:    "rgba(0,18,24,0.65)",
  invCurrency: "rgba(0,18,24,0.50)",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.sheetBg,
    color: C.zinc100,
    fontSize: 11,
    fontFamily: "Helvetica",
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    backgroundColor: C.black,
    paddingTop: 42,
    paddingBottom: 30,
    paddingHorizontal: 48,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  headerTitle: {
    fontSize: 38,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    lineHeight: 0.95,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: C.primary,
  },
  headerDateLabel: {
    fontSize: 10,
    color: C.textMuted,
    textAlign: "right",
  },
  headerDateValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    textAlign: "right",
    marginTop: 2,
  },

  // ── Body ────────────────────────────────────────────────
  body: {
    paddingHorizontal: 48,
    paddingTop: 36,
    paddingBottom: 28,
    flexGrow: 1,
  },

  intro: {
    fontSize: 13,
    color: C.textBody,
    lineHeight: 1.45,
    marginBottom: 28,
  },
  introBold: {
    fontFamily: "Helvetica-Bold",
    color: C.white,
  },

  // ── Services list ────────────────────────────────────────
  servicesCard: {
    borderWidth: 1,
    borderColor: C.divider,
    borderRadius: 4,
    backgroundColor: C.sheetElev,
    marginBottom: 20,
    overflow: "hidden",
  },
  servicesHead: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
    backgroundColor: C.sheetElev,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: C.primary,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  serviceItemLast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  serviceDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: C.primary,
    marginRight: 12,
  },
  serviceText: {
    fontSize: 12,
    color: C.zinc100,
  },

  // ── Investimento ─────────────────────────────────────────
  investimento: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  invLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: C.invLabel,
  },
  invValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  invCurrency: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.invCurrency,
    marginRight: 4,
  },
  invValue: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: C.primaryInk,
  },

  // ── Terms ────────────────────────────────────────────────
  termsTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: C.textMuted,
    marginBottom: 10,
  },
  termsGrid: {
    flexDirection: "column",
    flexWrap: "wrap",
  },
  termItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 10,
    paddingRight: 16,
    marginBottom: 8,
    position: "relative",
  },
  termDash: {
    position: "absolute",
    left: 0,
    top: 5,
    width: 5,
    height: 1,
    backgroundColor: C.zinc500,
  },
  termText: {
    fontSize: 10,
    color: C.termItem,
    lineHeight: 1.45,
  },

  // ── Footer ───────────────────────────────────────────────
  footer: {
    borderTopWidth: 1,
    borderTopColor: C.divider,
    paddingTop: 18,
    paddingBottom: 28,
    paddingHorizontal: 48,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  wordmarkName: {
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    lineHeight: 1,
    marginBottom: 4,
  },
  wordmarkRole: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: C.primary,
  },
  footerMeta: {
    fontSize: 9,
    color: C.textDim,
    textAlign: "right",
    maxWidth: 220,
    lineHeight: 1.5,
  },
});

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const TERMS = [
  "O prazo para finalização dos serviços é de 15 dias úteis.",
  "Para início do trabalho recebemos 20% do valor antecipado.",
  "Este orçamento tem validade de 20 dias corridos.",
];

export function OrcamentoPdf({ rascunho }: { rascunho: RascunhoOrcamento }) {
  const { dados, descricao } = rascunho;

  const serviceItems: string[] = [
    TIPOS_SERVICO_LABEL[dados.tipo],
    `Área de ${dados.area_m2} m²`,
    `Complexidade: ${COMPLEXIDADES_LABEL[dados.complexidade]}`,
    ...dados.fatores.map((f) => FATORES_LABEL[f]),
  ];

  // Extract client name from description (best-effort: first proper noun phrase)
  const clienteMatch = descricao.match(/(?:para|cliente|de)\s+([A-ZÁÉÍÓÚÀÂÊÔÃÕÇ][a-záéíóúàâêôãõç]+(?:\s+[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ][a-záéíóúàâêôãõç]+)*)/u);
  const cliente = clienteMatch ? clienteMatch[1] : "o(a) cliente";

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Orçamento</Text>
            <Text style={s.headerSubtitle}>Pintura de Alto Padrão</Text>
          </View>
          <View>
            <Text style={s.headerDateLabel}>Emitido em</Text>
            <Text style={s.headerDateValue}>{formatDate(new Date())}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={s.body}>

          {/* Intro */}
          <Text style={s.intro}>
            Proposta para pintura residencial para a cliente{" "}
            <Text style={s.introBold}>{cliente}</Text>
            , conforme escopo descrito abaixo.
          </Text>

          {/* Services list — no prices */}
          <View style={s.servicesCard}>
            <Text style={s.servicesHead}>Serviços inclusos</Text>
            {serviceItems.map((item, i) => (
              <View
                key={i}
                style={i < serviceItems.length - 1 ? s.serviceItem : s.serviceItemLast}
              >
                <View style={s.serviceDot} />
                <Text style={s.serviceText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Investimento */}
          <View style={s.investimento}>
            <Text style={s.invLabel}>Investimento</Text>
            <View style={s.invValueRow}>
              <Text style={s.invCurrency}>R$</Text>
              <Text style={s.invValue}>{formatBRL(dados.valor_final)}</Text>
            </View>
          </View>

          {/* Terms */}
          <Text style={s.termsTitle}>Condições</Text>
          <View style={s.termsGrid}>
            {TERMS.map((term, i) => (
              <View key={i} style={s.termItem}>
                <View style={s.termDash} />
                <Text style={s.termText}>{term}</Text>
              </View>
            ))}
          </View>

        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View>
            <Text style={s.wordmarkName}>Pintor Pro IA</Text>
            <Text style={s.wordmarkRole}>Pintura Residencial</Text>
          </View>
          <Text style={s.footerMeta}>
            Orçamento estimado. Valores podem ser ajustados após inspeção presencial.
          </Text>
        </View>

      </Page>
    </Document>
  );
}
