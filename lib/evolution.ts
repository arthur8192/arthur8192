import { createSupabaseAdminClient } from "./supabase";
import { isStimulusType, STIMULI_EFFECTS } from "./stimuli";
import type { ArthurState, Genome, MutationEvent, PendingStimulus } from "./types";

type AppliedStimuliResult = {
  state: ArthurState;
  modifier: number;
  mutationEvents: MutationEvent[];
  pendingLogIds: string[];
};

type MutationRule = {
  id: string;
  weight: number;
  condition: (state: ArthurState, genome: Genome) => boolean;
  apply: (state: ArthurState, genome: Genome, chaos: number) => void;
  describe: () => string;
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cloneState(state: ArthurState): ArthurState {
  return {
    ...state,
    pending_stimuli: Array.isArray(state.pending_stimuli)
      ? [...state.pending_stimuli]
      : []
  };
}

function normalizePendingStimulus(stimulus: PendingStimulus) {
  return typeof stimulus === "string" ? { stimulus_type: stimulus } : stimulus;
}

export function applyStimuliEffects(
  state: ArthurState,
  pendingStimuli: PendingStimulus[],
  chaosValue: number
): AppliedStimuliResult {
  const updatedState = cloneState(state);
  const mutationEvents: MutationEvent[] = [];
  const pendingLogIds: string[] = [];
  let modifier = 0;

  for (const pendingStimulus of pendingStimuli ?? []) {
    const normalized = normalizePendingStimulus(pendingStimulus);
    if (!isStimulusType(normalized.stimulus_type)) {
      continue;
    }

    const stimulus = STIMULI_EFFECTS[normalized.stimulus_type];

    if (normalized.id) {
      pendingLogIds.push(normalized.id);
    }

    const patch = stimulus.effect(updatedState);
    Object.assign(updatedState, patch);
    modifier += stimulus.mutationModifier;

    if (normalized.stimulus_type === "unknown_nutrient") {
      if (chaosValue > 0.66) {
        updatedState.glow_intensity = clamp(updatedState.glow_intensity + 0.12, 0, 1);
        updatedState.behavior_state = "agitated";
      } else if (chaosValue < 0.33) {
        updatedState.fatigue = clamp(updatedState.fatigue + 0.15, 0, 1);
        updatedState.behavior_state = "dormant";
      } else {
        updatedState.metabolic_rate = clamp(updatedState.metabolic_rate + 0.1, 0, 1);
      }
    }

    updatedState.pulse_rate = clamp(updatedState.pulse_rate, 0.1, 2.0);
    updatedState.movement_speed = clamp(updatedState.movement_speed, 0, 1);
    updatedState.metabolic_rate = clamp(updatedState.metabolic_rate, 0, 1);
    updatedState.hunger = clamp(updatedState.hunger, 0, 1);
    updatedState.fatigue = clamp(updatedState.fatigue, 0, 1);
    updatedState.glow_intensity = clamp(updatedState.glow_intensity, 0, 1);

    mutationEvents.push({
      event_type: "stimuli",
      trait_changed: normalized.stimulus_type,
      description: stimulus.publicMessage
    });
  }

  return {
    state: updatedState,
    modifier,
    mutationEvents,
    pendingLogIds
  };
}

function generateMicroDescription(state: ArthurState, microDelta: number): MutationEvent {
  const direction = microDelta >= 0 ? "expanded" : "contracted";

  return {
    event_type: "micro",
    trait_changed: "body_size,pulse_rate",
    description: `Arthur's membrane ${direction} by a barely perceptible amount. Resting pulse now reads ${state.pulse_rate.toFixed(2)}.`
  };
}

const weeklyMutations: MutationRule[] = [
  {
    id: "color_drift",
    weight: 30,
    condition: () => true,
    apply: (state, _genome, chaos) => {
      state.color_primary_r = Math.round(clamp(state.color_primary_r + (chaos - 0.5) * 20, 0, 255));
      state.color_primary_g = Math.round(clamp(state.color_primary_g + (0.5 - chaos) * 14, 0, 255));
      state.color_primary_b = Math.round(clamp(state.color_primary_b + (chaos - 0.5) * 10, 0, 255));
    },
    describe: () => "A subtle chromatic shift was observed in Arthur's outer membrane."
  },
  {
    id: "pulse_shift",
    weight: 25,
    condition: () => true,
    apply: (state, _genome, chaos) => {
      state.pulse_rate = clamp(state.pulse_rate * (0.85 + chaos * 0.3), 0.1, 2.0);
    },
    describe: () => "Arthur's resting pulse rhythm changed. The cause is unclear."
  },
  {
    id: "appendage_growth",
    weight: 15,
    condition: (state) => state.stage >= 2 && state.appendage_count < 8,
    apply: (state) => {
      state.appendage_count += 1;
    },
    describe: () => "A new protrusion has emerged from Arthur's lateral membrane."
  },
  {
    id: "eye_formation",
    weight: 10,
    condition: (state) => state.stage >= 2 && state.eye_count < 6,
    apply: (state) => {
      state.eye_count += 1;
    },
    describe: () => "A photosensitive structure has appeared on Arthur's surface."
  },
  {
    id: "bioluminescence_onset",
    weight: 10,
    condition: (state, genome) =>
      genome.bioluminescence_potential > 0.5 && !state.has_bioluminescence,
    apply: (state) => {
      state.has_bioluminescence = true;
      state.glow_intensity = 0.1;
    },
    describe: () => "Arthur's inner tissue began emitting a faint biological light."
  }
];

function chooseWeightedMutation(
  mutations: MutationRule[],
  state: ArthurState,
  genome: Genome,
  chaosValue: number
) {
  const available = mutations.filter((mutation) => mutation.condition(state, genome));
  const totalWeight = available.reduce((sum, mutation) => sum + mutation.weight, 0);

  if (!available.length || totalWeight <= 0) {
    return null;
  }

  let cursor = chaosValue * totalWeight;

  for (const mutation of available) {
    cursor -= mutation.weight;
    if (cursor <= 0) {
      return mutation;
    }
  }

  return available[available.length - 1];
}

function generateWeeklyMutation(
  state: ArthurState,
  genome: Genome,
  chaosValue: number
): MutationEvent | null {
  const mutation = chooseWeightedMutation(weeklyMutations, state, genome, chaosValue);

  if (!mutation) {
    return null;
  }

  mutation.apply(state, genome, chaosValue);

  return {
    event_type: "weekly",
    trait_changed: mutation.id,
    description: mutation.describe()
  };
}

function generateMajorEvent(
  state: ArthurState,
  genome: Genome,
  chaosValue: number
): MutationEvent | null {
  if (state.stage >= 3 && chaosValue > 0.6 && state.tentacle_count < 6) {
    state.tentacle_count += 1;
    state.texture = "organic";
    return {
      event_type: "monthly",
      trait_changed: "tentacle_count,texture",
      description: "A longer sensory tendril developed during the monthly observation window."
    };
  }

  if (state.stage >= 2 && chaosValue > 0.42 && state.body_shape !== "segmented") {
    state.body_shape = genome.symmetry_bias > 0.5 ? "segmented" : "asymmetric";
    state.body_size = clamp(state.body_size + 1.5 * genome.growth_rate, 1, 100);
    return {
      event_type: "monthly",
      trait_changed: "body_shape,body_size",
      description: "Arthur's body plan reorganized into a more complex structural pattern."
    };
  }

  state.movement_pattern = chaosValue > 0.5 ? "twitch" : "pulse";

  return {
    event_type: "monthly",
    trait_changed: "movement_pattern",
    description: "Arthur's movement cycle entered a new monthly rhythm."
  };
}

function generateRareEvent(state: ArthurState, genome: Genome): MutationEvent {
  if (state.stage >= 4 && state.eye_count < 8) {
    state.eye_count += 1;
    state.behavior_state = "exploring";
    return {
      event_type: "rare",
      trait_changed: "eye_count,behavior_state",
      description: "A sudden sensory bloom appeared. Arthur began scanning its enclosure differently."
    };
  }

  state.has_bioluminescence = true;
  state.glow_intensity = clamp(state.glow_intensity + 0.25 + genome.bioluminescence_potential * 0.2, 0, 1);
  state.glow_r = Math.round(clamp(state.glow_r + 20, 0, 255));
  state.glow_g = Math.round(clamp(state.glow_g + 35, 0, 255));

  return {
    event_type: "rare",
    trait_changed: "has_bioluminescence,glow_intensity",
    description: "A rare chaos spike triggered an internal glow event. Duration unknown."
  };
}

export function computeStage(state: ArthurState) {
  let stage = Math.max(1, state.stage);

  if (state.day_number >= 14 && state.body_size >= 15) {
    stage = Math.max(stage, 2);
  }

  if (state.day_number >= 30 && state.appendage_count >= 1) {
    stage = Math.max(stage, 3);
  }

  if (state.day_number >= 60 && state.eye_count >= 1) {
    stage = Math.max(stage, 4);
  }

  if (state.day_number >= 120 && stage >= 4) {
    stage = Math.max(stage, 5);
  }

  if (state.day_number >= 365 && stage >= 5) {
    stage = Math.max(stage, 6);
  }

  return clamp(stage, 1, 6);
}

export async function runEvolutionStep(arthurId: string) {
  const db = createSupabaseAdminClient();
  const { data: genome, error: genomeError } = await db
    .from("genome")
    .select("*")
    .eq("arthur_id", arthurId)
    .single<Genome>();

  if (genomeError || !genome) {
    throw new Error(`Unable to load genome for Arthur ${arthurId}: ${genomeError?.message}`);
  }

  const { data: state, error: stateError } = await db
    .from("arthur_state")
    .select("*")
    .eq("arthur_id", arthurId)
    .single<ArthurState>();

  if (stateError || !state) {
    throw new Error(`Unable to load state for Arthur ${arthurId}: ${stateError?.message}`);
  }

  const mutations: MutationEvent[] = [];
  const newChaosX = genome.chaos_r * genome.chaos_x * (1 - genome.chaos_x);
  const chaosValue = newChaosX;
  const stimuliResult = applyStimuliEffects(state, state.pending_stimuli, chaosValue);
  const updatedState = stimuliResult.state;
  const mutationChaosValue = clamp(chaosValue + stimuliResult.modifier, 0, 1);

  mutations.push(...stimuliResult.mutationEvents);

  const microDelta = (chaosValue - 0.5) * 0.1 * genome.growth_rate;
  updatedState.body_size = clamp(updatedState.body_size + microDelta, 1, 100);
  updatedState.pulse_rate = clamp(
    updatedState.pulse_rate + (chaosValue - 0.5) * 0.02,
    0.1,
    2.0
  );
  mutations.push(generateMicroDescription(updatedState, microDelta));

  if (state.day_number % 7 === 0) {
    const weeklyMutation = generateWeeklyMutation(updatedState, genome, mutationChaosValue);

    if (weeklyMutation) {
      mutations.push(weeklyMutation);
    }
  }

  if (state.day_number % 30 === 0) {
    const majorEvent = generateMajorEvent(updatedState, genome, mutationChaosValue);

    if (majorEvent) {
      mutations.push(majorEvent);
    }
  }

  if (mutationChaosValue > 0.97) {
    mutations.push(generateRareEvent(updatedState, genome));
  }

  updatedState.stage = computeStage(updatedState);
  updatedState.day_number = state.day_number + 1;
  updatedState.pending_stimuli = [];
  updatedState.last_evolution_at = new Date().toISOString();
  updatedState.updated_at = updatedState.last_evolution_at;

  const { error: stateUpdateError } = await db
    .from("arthur_state")
    .update(updatedState)
    .eq("arthur_id", arthurId);

  if (stateUpdateError) {
    throw new Error(`Unable to update Arthur state: ${stateUpdateError.message}`);
  }

  const { error: genomeUpdateError } = await db
    .from("genome")
    .update({ chaos_x: newChaosX })
    .eq("arthur_id", arthurId);

  if (genomeUpdateError) {
    throw new Error(`Unable to update genome chaos state: ${genomeUpdateError.message}`);
  }

  if (mutations.length) {
    const { error: mutationLogError } = await db.from("mutation_log").insert(
      mutations.map((mutation) => ({
        arthur_id: arthurId,
        day_number: updatedState.day_number,
        event_type: mutation.event_type,
        trait_changed: mutation.trait_changed,
        description: mutation.description,
        is_public: true
      }))
    );

    if (mutationLogError) {
      throw new Error(`Unable to write mutation log: ${mutationLogError.message}`);
    }
  }

  if (stimuliResult.pendingLogIds.length) {
    const { error: stimuliLogError } = await db
      .from("stimuli_log")
      .update({
        outcome_description: `Applied during day ${updatedState.day_number} evolution step.`
      })
      .in("id", stimuliResult.pendingLogIds);

    if (stimuliLogError) {
      throw new Error(`Unable to update stimuli log outcomes: ${stimuliLogError.message}`);
    }
  }

  return {
    arthur_id: arthurId,
    day: updatedState.day_number,
    events: mutations.map((mutation) => `${mutation.event_type}: ${mutation.trait_changed}`),
    mutations
  };
}
