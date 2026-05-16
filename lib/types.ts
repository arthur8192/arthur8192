export type Genome = {
  arthur_id: string;
  chaos_r: number;
  chaos_x: number;
  growth_rate: number;
  mutation_volatility: number;
  color_seed: number;
  symmetry_bias: number;
  bioluminescence_potential: number;
  movement_tendency: number;
  metabolism_base: number;
  lifespan_days: number;
  created_at?: string;
};

export type PendingStimulus =
  | string
  | {
      id?: string;
      stimulus_type: string;
    };

export type ArthurState = {
  arthur_id: string;
  day_number: number;
  body_size: number;
  body_shape: string;
  appendage_count: number;
  eye_count: number;
  tentacle_count: number;
  has_membrane: boolean;
  has_bioluminescence: boolean;
  color_primary_r: number;
  color_primary_g: number;
  color_primary_b: number;
  color_secondary_r: number;
  color_secondary_g: number;
  color_secondary_b: number;
  glow_r: number;
  glow_g: number;
  glow_b: number;
  glow_intensity: number;
  transparency: number;
  texture: string;
  pulse_rate: number;
  movement_speed: number;
  movement_pattern: string;
  metabolic_rate: number;
  hunger: number;
  fatigue: number;
  behavior_state: string;
  stage: number;
  pending_stimuli: PendingStimulus[];
  last_evolution_at: string;
  updated_at: string;
};

export type MutationEvent = {
  event_type: "micro" | "weekly" | "monthly" | "rare" | "stimuli";
  trait_changed: string;
  description: string;
};
