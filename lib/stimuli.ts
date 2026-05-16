import type { ArthurState } from "./types";

export type StimulusCategory = "Resources" | "Environment" | "Interaction" | "Observation";

export type StimulusEffect = {
  label: string;
  category: StimulusCategory;
  effect: (state: ArthurState) => Partial<ArthurState>;
  mutationModifier: number;
  publicMessage: string;
};

export const STIMULI_EFFECTS = {
  feed_water: {
    label: "Introduce Water",
    category: "Resources",
    effect: (state) => ({
      hunger: Math.max(0, state.hunger - 0.3),
      metabolic_rate: Math.min(1, state.metabolic_rate + 0.08)
    }),
    mutationModifier: 0.0,
    publicMessage: "Water introduced. Arthur's membrane response is unknown."
  },
  introduce_carbon: {
    label: "Introduce Carbon",
    category: "Resources",
    effect: (state) => ({
      metabolic_rate: Math.min(1, state.metabolic_rate + 0.12)
    }),
    mutationModifier: 0.1,
    publicMessage: "Carbon compound detected near Arthur. Cellular response pending."
  },
  introduce_nitrogen: {
    label: "Introduce Nitrogen",
    category: "Resources",
    effect: (state) => ({
      metabolic_rate: Math.min(1, state.metabolic_rate + 0.05)
    }),
    mutationModifier: 0.05,
    publicMessage: "Nitrogen trace introduced. Arthur's response is being monitored."
  },
  introduce_oxygen: {
    label: "Introduce Oxygen",
    category: "Resources",
    effect: (state) => ({
      metabolic_rate: Math.min(1, state.metabolic_rate + 0.15),
      fatigue: Math.max(0, state.fatigue - 0.2)
    }),
    mutationModifier: 0.08,
    publicMessage: "Oxygen introduced. Increased metabolic activity detected."
  },
  unknown_nutrient: {
    label: "Unknown Nutrient",
    category: "Resources",
    effect: (state) => state,
    mutationModifier: 0.25,
    publicMessage: "Unknown compound introduced. Arthur's response is... unclear."
  },
  expose_light: {
    label: "Expose to Light",
    category: "Environment",
    effect: (state) => ({
      behavior_state: "active",
      glow_intensity: Math.min(1, state.glow_intensity + 0.05)
    }),
    mutationModifier: 0.05,
    publicMessage: "Light source activated. Arthur has responded."
  },
  trigger_darkness: {
    label: "Trigger Darkness",
    category: "Environment",
    effect: (state) => ({
      behavior_state: state.has_bioluminescence ? "active" : "dormant",
      glow_intensity: state.has_bioluminescence
        ? Math.min(1, state.glow_intensity + 0.15)
        : state.glow_intensity
    }),
    mutationModifier: 0.0,
    publicMessage: "Light removed. Arthur has entered a different state."
  },
  increase_warmth: {
    label: "Increase Warmth",
    category: "Environment",
    effect: (state) => ({
      metabolic_rate: Math.min(1, state.metabolic_rate + 0.2),
      movement_speed: Math.min(1, state.movement_speed + 0.1),
      behavior_state: "active"
    }),
    mutationModifier: 0.15,
    publicMessage: "Temperature raised. Arthur's activity has increased."
  },
  lower_temperature: {
    label: "Lower Temperature",
    category: "Environment",
    effect: (state) => ({
      metabolic_rate: Math.max(0, state.metabolic_rate - 0.15),
      behavior_state: "dormant"
    }),
    mutationModifier: -0.1,
    publicMessage: "Temperature lowered. Arthur has become less active."
  },
  play_sound: {
    label: "Play Tone",
    category: "Interaction",
    effect: (state) => ({
      pulse_rate: state.pulse_rate + (Math.random() * 0.2 - 0.1),
      fatigue: Math.max(0, state.fatigue - 0.1)
    }),
    mutationModifier: 0.03,
    publicMessage: "Auditory signal introduced. Arthur's pulse rhythm shifted."
  },
  probe: {
    label: "Probe",
    category: "Observation",
    effect: () => ({
      behavior_state: "agitated"
    }),
    mutationModifier: 0.2,
    publicMessage: "Physical probe contact made. Arthur has responded to the stimulus."
  },
  observe: {
    label: "Observe",
    category: "Observation",
    effect: (state) => state,
    mutationModifier: 0.0,
    publicMessage: "Observation recorded. No active stimulus applied."
  },
  scan: {
    label: "Scan",
    category: "Observation",
    effect: (state) => state,
    mutationModifier: 0.0,
    publicMessage: "Bioscan initiated. Full reading logged."
  }
} satisfies Record<string, StimulusEffect>;

export type StimulusType = keyof typeof STIMULI_EFFECTS;

export function isStimulusType(value: string): value is StimulusType {
  return Object.hasOwn(STIMULI_EFFECTS, value);
}
