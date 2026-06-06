import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

  const rows = await db.select().from(profiles).where(eq(profiles.id, user.id));
  const profile = rows[0];

  // Fallback para dados do auth quando campos vazios (usuário recém-cadastrado)
  const authNome = (user.user_metadata?.nome as string | undefined) ?? "";
  const authEmail = user.email ?? "";

  if (!profile) {
    return NextResponse.json({
      nome: authNome,
      telefone: "",
      email: authEmail,
      cidade: "",
      condicoes: [],
      logoUrl: null,
      novoUsuario: true,
    });
  }

  // logoUrl no DB é o path (ex: "userId/logo.png"); gera signed URL para o client
  let logoSignedUrl: string | null = null;
  if (profile.logoUrl && !profile.logoUrl.startsWith("http")) {
    const admin = createAdminClient();
    const { data } = await admin.storage.from("logos").createSignedUrl(profile.logoUrl, 3600);
    logoSignedUrl = data?.signedUrl ?? null;
  } else {
    logoSignedUrl = profile.logoUrl ?? null;
  }

  return NextResponse.json({
    ...profile,
    nome: profile.nome || authNome,
    email: profile.email || authEmail,
    logoUrl: logoSignedUrl,
    logoPath: profile.logoUrl ?? null,
    novoUsuario: false,
  });
}

export async function PUT(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { nome, telefone, email, cidade, logoPath, condicoes } = body as {
    nome?: string;
    telefone?: string;
    email?: string;
    cidade?: string;
    logoPath?: string | null; // path bruto no Storage
    condicoes?: string[];
  };

  const now = new Date();
  const values = {
    id: user.id,
    nome: nome ?? "",
    telefone: telefone ?? "",
    email: email ?? "",
    cidade: cidade ?? "",
    logoUrl: logoPath ?? null, // campo DB guarda o path
    condicoes: condicoes ?? [],
    updatedAt: now,
  };

  await db
    .insert(profiles)
    .values(values)
    .onConflictDoUpdate({ target: profiles.id, set: { ...values, id: undefined } });

  return NextResponse.json({ ok: true });
}
