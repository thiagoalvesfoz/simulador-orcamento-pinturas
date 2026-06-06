import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { orcamentos } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";

export const runtime = "nodejs";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(orcamentos)
    .where(and(eq(orcamentos.profileId, user.id), eq(orcamentos.status, "finalizado")))
    .orderBy(desc(orcamentos.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { descricao: string; dados: unknown };

  const inserted = await db
    .insert(orcamentos)
    .values({
      profileId: user.id,
      status: "rascunho",
      descricao: body.descricao ?? "",
      dados: body.dados,
      valorFinal: String((body.dados as { valor_final?: number })?.valor_final ?? 0),
    })
    .returning({ id: orcamentos.id });

  return NextResponse.json({ id: inserted[0].id });
}
