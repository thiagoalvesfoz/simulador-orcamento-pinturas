import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import HomeClient from "./HomeClient";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const rows = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, user.id));
    if (rows.length === 0) {
      redirect("/perfil?onboarding=1");
    }
  }

  return <HomeClient />;
}
