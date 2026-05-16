import { createSupabaseAdminClient } from "@/lib/supabase";

type RouteContext = {
  params: {
    username: string;
  };
};

export async function GET(request: Request, { params }: RouteContext) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 20) || 20, 100);
  const offset = Math.max(Number(searchParams.get("offset") ?? 0) || 0, 0);
  const db = createSupabaseAdminClient();
  const { data: arthur, error: arthurError } = await db
    .from("arthurs")
    .select("id")
    .eq("username", params.username)
    .single();

  if (arthurError || !arthur) {
    return Response.json({ error: "Arthur not found" }, { status: 404 });
  }

  const { data: log, error: logError } = await db
    .from("mutation_log")
    .select("day_number, event_type, description, recorded_at")
    .eq("arthur_id", arthur.id)
    .eq("is_public", true)
    .order("day_number", { ascending: false })
    .order("recorded_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (logError) {
    return Response.json({ error: "Unable to load mutation log" }, { status: 500 });
  }

  return Response.json({ log: log ?? [] });
}
