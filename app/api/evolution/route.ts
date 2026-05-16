import { runEvolutionStep } from "@/lib/evolution";
import { createSupabaseAdminClient } from "@/lib/supabase";

async function logCronRun(
  db: ReturnType<typeof createSupabaseAdminClient>,
  entry: {
    status: "success" | "failure";
    processed: number;
    outcome?: unknown;
    error_message?: string;
  }
) {
  await db.from("system_log").insert({
    event_type: "daily_evolution",
    status: entry.status,
    processed: entry.processed,
    outcome: entry.outcome ?? null,
    error_message: entry.error_message ?? null
  });
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createSupabaseAdminClient();

  try {
    const { data: arthurs, error } = await db
      .from("arthurs")
      .select("id")
      .eq("is_alive", true);

    if (error) {
      await logCronRun(db, {
        status: "failure",
        processed: 0,
        error_message: error.message
      });
      return Response.json({ error: "Unable to load living Arthurs" }, { status: 500 });
    }

    const mutations = [];

    for (const arthur of arthurs ?? []) {
      mutations.push(await runEvolutionStep(arthur.id));
    }

    const outcome = {
      processed: mutations.length,
      mutations
    };

    await logCronRun(db, {
      status: "success",
      processed: mutations.length,
      outcome
    });

    return Response.json(outcome);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown cron failure";
    await logCronRun(db, {
      status: "failure",
      processed: 0,
      error_message: message
    });
    return Response.json({ error: "Evolution run failed" }, { status: 500 });
  }
}
