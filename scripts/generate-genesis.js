const { createHash, randomUUID } = require("crypto");

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function deriveGenome(seed, username, timestampMs) {
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

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const seed = requiredEnv("ARTHUR_MVP_SEED");
const ownerId = requiredEnv("CREATOR_USER_ID");
const username = process.env.ARTHUR_MVP_USERNAME ?? "doma8192";
const arthurId = process.env.ARTHUR_MVP_ARTHUR_ID ?? randomUUID();
const timestampMs = Number(process.env.ARTHUR_MVP_TIMESTAMP_MS ?? Date.now());
const birthTimestamp = new Date(timestampMs).toISOString();
const genome = deriveGenome(seed, username, timestampMs);

console.log(`-- Project Arthur genesis SQL`);
console.log(`-- username: ${username}`);
console.log(`-- arthur_id: ${arthurId}`);
console.log(`-- timestamp_ms: ${timestampMs}`);
console.log(`-- birth_timestamp: ${birthTimestamp}`);
console.log("");
console.log(`insert into profiles (id, username, display_name)`);
console.log(`values (${sqlString(ownerId)}, ${sqlString(username)}, 'doma8192')`);
console.log(`on conflict (id) do update set username = excluded.username, display_name = excluded.display_name;`);
console.log("");
console.log(`insert into arthurs (id, owner_id, username, seed, birth_timestamp, is_alive)`);
console.log(`values (${sqlString(arthurId)}, ${sqlString(ownerId)}, ${sqlString(username)}, ${sqlString(seed)}, ${sqlString(birthTimestamp)}, true)`);
console.log(`on conflict (id) do nothing;`);
console.log("");
console.log(`insert into genome (`);
console.log(`  arthur_id, chaos_r, chaos_x, growth_rate, mutation_volatility, color_seed,`);
console.log(`  symmetry_bias, bioluminescence_potential, movement_tendency, metabolism_base, lifespan_days`);
console.log(`) values (`);
console.log(`  ${sqlString(arthurId)}, ${genome.chaos_r}, ${genome.chaos_x}, ${genome.growth_rate}, ${genome.mutation_volatility}, ${genome.color_seed},`);
console.log(`  ${genome.symmetry_bias}, ${genome.bioluminescence_potential}, ${genome.movement_tendency}, ${genome.metabolism_base}, ${genome.lifespan_days}`);
console.log(`);`);
console.log("");
console.log(`insert into arthur_state (`);
console.log(`  arthur_id, day_number, body_size, body_shape, appendage_count, eye_count,`);
console.log(`  tentacle_count, has_membrane, has_bioluminescence, stage, behavior_state`);
console.log(`) values (`);
console.log(`  ${sqlString(arthurId)}, 1, 10.0, 'cell', 0, 0, 0, true, false, 1, 'dormant'`);
console.log(`);`);
