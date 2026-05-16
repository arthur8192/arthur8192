import { isStimulusType, STIMULI_EFFECTS } from "@/lib/stimuli";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient
} from "@/lib/supabase";
import type { PendingStimulus } from "@/lib/types";

export async function GET() {
  const authClient = createSupabaseServerClient();
  const {
    data: { user }
  } = await authClient.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.id !== process.env.CREATOR_USER_ID) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = createSupabaseAdminClient();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await db
    .from("stimuli_log")
    .select("id", { count: "exact", head: true })
    .eq("applied_by", user.id)
    .gte("applied_at", twentyFourHoursAgo);

  if (error) {
    return Response.json({ error: "Unable to verify stimulus limit" }, { status: 500 });
  }

  return Response.json({
    used: count ?? 0,
    remaining: Math.max(0, 3 - (count ?? 0)),
    limit: 3
  });
}

export async function POST(request: Request) {
  const authClient = createSupabaseServerClient();
  const {
    data: { user }
  } = await authClient.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.id !== process.env.CREATOR_USER_ID) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const arthurId = typeof body?.arthur_id === "string" ? body.arthur_id : "";
  const stimulusType = typeof body?.stimulus_type === "string" ? body.stimulus_type : "";

  if (!arthurId || !isStimulusType(stimulusType)) {
    return Response.json({ error: "Invalid stimulus request" }, { status: 400 });
  }

  const db = createSupabaseAdminClient();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await db
    .from("stimuli_log")
    .select("id", { count: "exact", head: true })
    .eq("applied_by", user.id)
    .gte("applied_at", twentyFourHoursAgo);

  if (countError) {
    return Response.json({ error: "Unable to verify stimulus limit" }, { status: 500 });
  }

  if ((count ?? 0) >= 3) {
    return Response.json({ error: "Daily limit reached" }, { status: 429 });
  }

  const { data: arthur, error: arthurError } = await db
    .from("arthurs")
    .select("id, owner_id")
    .eq("id", arthurId)
    .single();

  if (arthurError || !arthur) {
    return Response.json({ error: "Arthur not found" }, { status: 404 });
  }

  if (arthur.owner_id !== user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: state, error: stateError } = await db
    .from("arthur_state")
    .select("day_number, pending_stimuli")
    .eq("arthur_id", arthurId)
    .single();

  if (stateError || !state) {
    return Response.json({ error: "Arthur state not found" }, { status: 404 });
  }

  const { data: stimuliLog, error: insertError } = await db
    .from("stimuli_log")
    .insert({
      arthur_id: arthurId,
      applied_by: user.id,
      stimulus_type: stimulusType,
      day_number: state.day_number
    })
    .select("id")
    .single();

  if (insertError || !stimuliLog) {
    return Response.json({ error: "Unable to log stimulus" }, { status: 500 });
  }

  const pendingStimuli = Array.isArray(state.pending_stimuli)
    ? (state.pending_stimuli as PendingStimulus[])
    : [];
  const nextPendingStimuli: PendingStimulus[] = [
    ...pendingStimuli,
    {
      id: stimuliLog.id,
      stimulus_type: stimulusType
    }
  ];

  const { error: updateError } = await db
    .from("arthur_state")
    .update({ pending_stimuli: nextPendingStimuli })
    .eq("arthur_id", arthurId);

  if (updateError) {
    return Response.json({ error: "Unable to queue stimulus" }, { status: 500 });
  }

  return Response.json({
    success: true,
    message: STIMULI_EFFECTS[stimulusType].publicMessage,
    queued: true
  });
}
