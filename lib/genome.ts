import { createHash } from "crypto";

export type GenesisGenome = {
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
};

export function deriveGenome(
  seed: string,
  username: string,
  timestampMs: number
): GenesisGenome {
  const input = `${seed}:${username}:${timestampMs}`;
  const hash = createHash("sha256").update(input).digest("hex");
  const bytes = Buffer.from(hash, "hex");

  return {
    chaos_r: 3.57 + (bytes[0] / 255) * 0.42,
    chaos_x: 0.01 + (bytes[1] / 255) * 0.98,
    growth_rate: bytes[2] / 255,
    mutation_volatility: bytes[3] / 255,
    color_seed: Math.floor((bytes[4] / 255) * 360),
    symmetry_bias: bytes[5] / 255,
    bioluminescence_potential: bytes[6] / 255,
    movement_tendency: bytes[7] / 255,
    metabolism_base: bytes[8] / 255,
    lifespan_days: 365 + Math.floor((bytes[9] / 255) * 3650)
  };
}
