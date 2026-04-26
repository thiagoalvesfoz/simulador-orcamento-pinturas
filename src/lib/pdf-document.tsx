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

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#18181b",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#18181b",
    paddingBottom: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#71717a",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#52525b",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.5,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 4,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  rowLast: {
    flexDirection: "row",
  },
  cellLabel: {
    flex: 1,
    padding: 8,
    backgroundColor: "#fafafa",
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  cellValue: {
    flex: 2,
    padding: 8,
    fontSize: 10,
  },
  faixa: {
    backgroundColor: "#fafafa",
    borderRadius: 4,
    padding: 12,
    marginTop: 8,
  },
  faixaLabel: {
    fontSize: 9,
    color: "#71717a",
    marginBottom: 2,
  },
  faixaValor: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  total: {
    backgroundColor: "#18181b",
    color: "#ffffff",
    borderRadius: 4,
    padding: 16,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 12,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
  },
  totalValor: {
    fontSize: 18,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 9,
    color: "#a1a1aa",
    textAlign: "center",
  },
});

const formatadorBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatadorData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function OrcamentoPdf({ rascunho }: { rascunho: RascunhoOrcamento }) {
  const { dados, descricao } = rascunho;
  const fatoresTexto =
    dados.fatores.length > 0
      ? dados.fatores.map((f) => FATORES_LABEL[f]).join(", ")
      : "Nenhum";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Orçamento de Pintura</Text>
          <Text style={styles.subtitle}>
            Emitido em {formatadorData.format(new Date())}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição do serviço</Text>
          <Text style={styles.paragraph}>{descricao}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          <View style={styles.table}>
            <View style={styles.row}>
              <Text style={styles.cellLabel}>Tipo</Text>
              <Text style={styles.cellValue}>
                {TIPOS_SERVICO_LABEL[dados.tipo]}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cellLabel}>Área</Text>
              <Text style={styles.cellValue}>{dados.area_m2} m²</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cellLabel}>Complexidade</Text>
              <Text style={styles.cellValue}>
                {COMPLEXIDADES_LABEL[dados.complexidade]}
              </Text>
            </View>
            <View style={styles.rowLast}>
              <Text style={styles.cellLabel}>Fatores adicionais</Text>
              <Text style={styles.cellValue}>{fatoresTexto}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valor</Text>
          <View style={styles.faixa}>
            <Text style={styles.faixaLabel}>Faixa sugerida</Text>
            <Text style={styles.faixaValor}>
              {formatadorBRL.format(dados.faixa_preco_min)} —{" "}
              {formatadorBRL.format(dados.faixa_preco_max)}
            </Text>
          </View>
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Valor final</Text>
            <Text style={styles.totalValor}>
              {formatadorBRL.format(dados.valor_final)}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Orçamento estimado. Valores podem ser ajustados após inspeção
          presencial.
        </Text>
      </Page>
    </Document>
  );
}
