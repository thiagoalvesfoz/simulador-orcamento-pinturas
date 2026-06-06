import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "png";
  const path = `${user.id}/logo.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from("logos")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    console.error("Storage upload error:", uploadError.message);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Retorna signed URL (1h) para preview imediato; DB guarda só o path
  const { data: signed, error: signError } = await admin.storage
    .from("logos")
    .createSignedUrl(path, 3600);

  if (signError || !signed) {
    return NextResponse.json({ error: "Falha ao gerar URL" }, { status: 500 });
  }

  return NextResponse.json({ url: signed.signedUrl, path });
}
