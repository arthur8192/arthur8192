function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function rightRotate(value, amount) {
  return (value >>> amount) | (value << (32 - amount));
}

function sha256Bytes(input) {
  const bytes = Array.from(new TextEncoder().encode(input));
  const bitLength = bytes.length * 8;
  const words = new Array(64);
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  bytes.push(0x80);

  while (bytes.length % 64 !== 56) {
    bytes.push(0);
  }

  const highLength = Math.floor(bitLength / 0x100000000);
  const lowLength = bitLength >>> 0;

  bytes.push(
    (highLength >>> 24) & 0xff,
    (highLength >>> 16) & 0xff,
    (highLength >>> 8) & 0xff,
    highLength & 0xff,
    (lowLength >>> 24) & 0xff,
    (lowLength >>> 16) & 0xff,
    (lowLength >>> 8) & 0xff,
    lowLength & 0xff
  );

  for (let chunk = 0; chunk < bytes.length; chunk += 64) {
    for (let index = 0; index < 16; index += 1) {
      const offset = chunk + index * 4;
      words[index] =
        ((bytes[offset] << 24) |
          (bytes[offset + 1] << 16) |
          (bytes[offset + 2] << 8) |
          bytes[offset + 3]) >>>
        0;
    }

    for (let index = 16; index < 64; index += 1) {
      const s0 =
        rightRotate(words[index - 15], 7) ^
        rightRotate(words[index - 15], 18) ^
        (words[index - 15] >>> 3);
      const s1 =
        rightRotate(words[index - 2], 17) ^
        rightRotate(words[index - 2], 19) ^
        (words[index - 2] >>> 10);
      words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let index = 0; index < 64; index += 1) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + SHA256_K[index] + words[index]) >>> 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7].flatMap((word) => [
    (word >>> 24) & 0xff,
    (word >>> 16) & 0xff,
    (word >>> 8) & 0xff,
    word & 0xff
  ]);
}

function deriveGenome(seed, username, timestampMs) {
  const input = `${seed}:${username}:${timestampMs}`;
  const bytes = sha256Bytes(input);

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
const arthurId = process.env.ARTHUR_MVP_ARTHUR_ID ?? crypto.randomUUID();
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
