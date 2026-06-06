import { pgTable, text, uuid, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // mesmo ID do auth.users
  nome: text("nome").notNull().default(""),
  telefone: text("telefone").notNull().default(""),
  email: text("email").notNull().default(""),
  cidade: text("cidade").notNull().default(""),
  logoUrl: text("logo_url"), // URL no Supabase Storage (bucket "logos")
  condicoes: jsonb("condicoes").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const orcamentos = pgTable("orcamentos", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("rascunho"), // rascunho | finalizado
  numero: text("numero").notNull().default(""),
  nomeCliente: text("nome_cliente").notNull().default(""),
  descricao: text("descricao").notNull().default(""),
  // DadosOrcamento completo (itens, faixa, valor_final)
  dados: jsonb("dados").notNull(),
  observacoes: text("observacoes"),
  valorFinal: numeric("valor_final", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Orcamento = typeof orcamentos.$inferSelect;
export type NewOrcamento = typeof orcamentos.$inferInsert;
