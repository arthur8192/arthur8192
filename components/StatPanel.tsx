import type { ArthurState } from "@/lib/types";

const stageNames = [
  "Unknown",
  "Survival",
  "Safety",
  "Recognition",
  "Expression",
  "Self-Direction",
  "Proto-Intelligence"
];

type StatPanelProps = {
  state: ArthurState;
};

export function StatPanel({ state }: StatPanelProps) {
  const stats = [
    ["Body size", state.body_size.toFixed(1)],
    ["Appendages", String(state.appendage_count)],
    ["Eyes", String(state.eye_count)],
    ["Tentacles", String(state.tentacle_count)],
    ["Pulse", state.pulse_rate.toFixed(2)],
    ["Glow", state.glow_intensity.toFixed(2)]
  ];

  return (
    <aside className="stat-panel">
      <header>
        <span>SPECIMEN</span>
        <h2>ARTHUR</h2>
      </header>
      <div className="stat-panel__primary">
        <span>AGE: {state.day_number} DAYS</span>
        <span>STAGE: {state.stage}/6</span>
        <span>STATUS: {state.behavior_state.toUpperCase()}</span>
      </div>
      <h3>PUBLIC STATS:</h3>
      <dl>
        {stats.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        <div>
          <dt>Stage</dt>
          <dd>{stageNames[state.stage] ?? "Unknown"}</dd>
        </div>
      </dl>
      <button className="panel-button" type="button">
        SHARE ARTHUR
      </button>
    </aside>
  );
}
