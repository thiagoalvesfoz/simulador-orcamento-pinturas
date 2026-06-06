import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { orcamentos } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rows = await db
    .select()
    .from(orcamentos)
    .where(and(eq(orcamentos.id, id), eq(orcamentos.profileId, user.id)));

  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as {
    numero?: string;
    nomeCliente?: string;
    observacoes?: string | null;
    dados?: unknown;
    valorFinal?: number;
    status?: string;
  };

  const patch: Record<string, unknown> = {};
  if (body.numero !== undefined) patch.numero = body.numero;
  if (body.nomeCliente !== undefined) patch.nomeCliente = body.nomeCliente;
  if (body.observacoes !== undefined) patch.observacoes = body.observacoes;
  if (body.dados !== undefined) patch.dados = body.dados;
  if (body.valorFinal !== undefined) patch.valorFinal = String(body.valorFinal);
  if (body.status !== undefined) patch.status = body.status;

  await db
    .update(orcamentos)
    .set(patch)
    .where(and(eq(orcamentos.id, id), eq(orcamentos.profileId, user.id)));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: Params
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db
    .delete(orcamentos)
    .where(and(eq(orcamentos.id, id), eq(orcamentos.profileId, user.id)));

  return NextResponse.json({ ok: true });
}
