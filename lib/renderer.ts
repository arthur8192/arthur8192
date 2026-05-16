import type { ArthurState, Genome } from "./types";

export const CANVAS_SIZE = 128;

function rgba(r: number, g: number, b: number, a = 1) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  eyeCount: number,
  time: number
) {
  if (eyeCount <= 0) {
    return;
  }

  const visibleEyes = Math.min(eyeCount, 8);
  const blink = Math.sin(time * 1.7) > 0.94;

  for (let index = 0; index < visibleEyes; index += 1) {
    const angle = -Math.PI / 2 + (index / visibleEyes) * Math.PI * 2;
    const distance = baseRadius * 0.42;
    const x = cx + Math.cos(angle) * distance;
    const y = cy + Math.sin(angle) * distance * 0.78;
    const radius = Math.max(1.2, baseRadius * 0.09);

    ctx.beginPath();
    ctx.ellipse(x, y, radius, blink ? 0.45 : radius * 1.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(2, 8, 10, 0.92)";
    ctx.fill();

    if (!blink) {
      ctx.beginPath();
      ctx.arc(x - radius * 0.25, y - radius * 0.2, Math.max(0.5, radius * 0.28), 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 255, 224, 0.72)";
      ctx.fill();
    }
  }
}

function drawAppendages(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  appendageCount: number,
  symmetryBias: number,
  time: number
) {
  if (appendageCount <= 0) {
    return;
  }

  const visibleAppendages = Math.min(appendageCount, 12);
  const asymmetry = 1 - symmetryBias;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let index = 0; index < visibleAppendages; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const row = Math.floor(index / 2);
    const angle = side * (0.55 + row * 0.34 + asymmetry * 0.18);
    const sway = Math.sin(time * 1.4 + index * 0.9) * (2.5 + asymmetry * 2);
    const startX = cx + Math.cos(angle) * baseRadius * 0.72;
    const startY = cy + Math.sin(angle) * baseRadius * 0.72;
    const length = baseRadius * (0.42 + (index % 3) * 0.1);
    const endX = startX + Math.cos(angle) * length + sway;
    const endY = startY + Math.sin(angle) * length + Math.sin(time + index) * 1.5;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      (startX + endX) / 2 + sway * 0.6,
      (startY + endY) / 2 + Math.cos(time + index) * 2,
      endX,
      endY
    );
    ctx.strokeStyle = "rgba(0, 200, 160, 0.46)";
    ctx.lineWidth = Math.max(1, baseRadius * 0.08);
    ctx.stroke();
  }
}

function drawTexture(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  texture: string,
  time: number
) {
  const marks = texture === "spiky" ? 18 : texture === "crystalline" ? 14 : 22;

  for (let index = 0; index < marks; index += 1) {
    const angle = (index / marks) * Math.PI * 2;
    const jitter = Math.sin(time * 0.9 + index * 2.13) * 0.08;
    const distance = baseRadius * (0.22 + ((index * 37) % 55) / 100 + jitter);
    const x = cx + Math.cos(angle) * distance;
    const y = cy + Math.sin(angle) * distance;

    if (texture === "spiky") {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        cx + Math.cos(angle) * baseRadius * 1.05,
        cy + Math.sin(angle) * baseRadius * 1.05
      );
      ctx.strokeStyle = "rgba(200, 216, 232, 0.26)";
      ctx.lineWidth = 1;
      ctx.stroke();
      continue;
    }

    if (texture === "crystalline") {
      ctx.beginPath();
      ctx.rect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
      ctx.fillStyle = "rgba(200, 216, 232, 0.36)";
      ctx.fill();
      continue;
    }

    ctx.beginPath();
    ctx.arc(x, y, texture === "mottled" ? 1.4 : 1, 0, Math.PI * 2);
    ctx.fillStyle = texture === "organic"
      ? "rgba(0, 255, 224, 0.22)"
      : "rgba(8, 12, 15, 0.24)";
    ctx.fill();
  }
}

export function drawArthur(
  ctx: CanvasRenderingContext2D,
  state: ArthurState,
  genome: Genome,
  time: number
) {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.imageSmoothingEnabled = false;

  const cx = CANVAS_SIZE / 2;
  const cy = CANVAS_SIZE / 2;
  const breathe = 1 + Math.sin(time * state.pulse_rate) * 0.04;
  const baseRadius = clamp((state.body_size / 100) * 30 * breathe, 3, 34);

  if (state.has_bioluminescence && state.glow_intensity > 0) {
    ctx.shadowBlur = 15 * state.glow_intensity;
    ctx.shadowColor = rgba(
      state.glow_r,
      state.glow_g,
      state.glow_b,
      state.glow_intensity
    );
  }

  const asymmetry = 1 - genome.symmetry_bias * 0.3;
  ctx.beginPath();
  ctx.ellipse(cx, cy, baseRadius * asymmetry, baseRadius, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(
    state.color_primary_r,
    state.color_primary_g,
    state.color_primary_b,
    1 - state.transparency
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.ellipse(cx, cy, baseRadius * 0.6, baseRadius * 0.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(
    state.color_secondary_r,
    state.color_secondary_g,
    state.color_secondary_b,
    0.4
  );
  ctx.fill();

  drawEyes(ctx, cx, cy, baseRadius, state.eye_count, time);
  drawAppendages(ctx, cx, cy, baseRadius, state.appendage_count, genome.symmetry_bias, time);

  if (state.texture !== "smooth") {
    drawTexture(ctx, cx, cy, baseRadius, state.texture, time);
  }

  if (state.has_bioluminescence) {
    const glowPulse = (Math.sin(time * state.pulse_rate * 1.5) + 1) / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = rgba(
      state.glow_r,
      state.glow_g,
      state.glow_b,
      glowPulse * state.glow_intensity * 0.8
    );
    ctx.fill();
  }
}
