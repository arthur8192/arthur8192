import { createSupabaseAdminClient } from "@/lib/supabase";

type RouteContext = {
  params: {
    username: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  const db = createSupabaseAdminClient();
  const { data: arthur, error: arthurError } = await db
    .from("arthurs")
    .select("id, username, is_alive, birth_timestamp")
    .eq("username", params.username)
    .single();

  if (arthurError || !arthur) {
    return Response.json({ error: "Arthur not found" }, { status: 404 });
  }

  const [{ data: state, error: stateError }, { data: genome, error: genomeError }] =
    await Promise.all([
      db.from("arthur_state").select("*").eq("arthur_id", arthur.id).single(),
      db
        .from("genome")
        .select(
          "growth_rate, mutation_volatility, color_seed, symmetry_bias, bioluminescence_potential, movement_tendency, metabolism_base, lifespan_days"
        )
        .eq("arthur_id", arthur.id)
        .single()
    ]);

  if (stateError || !state) {
    return Response.json({ error: "Arthur state not found" }, { status: 404 });
  }

  if (genomeError || !genome) {
    return Response.json({ error: "Arthur genome not found" }, { status: 404 });
  }

  return Response.json({
    arthur: {
      id: arthur.id,
      username: arthur.username,
      day_number: state.day_number,
      is_alive: arthur.is_alive,
      birth_timestamp: arthur.birth_timestamp,
      state,
      genome
    }
  });
}
