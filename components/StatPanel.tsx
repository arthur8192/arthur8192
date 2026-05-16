"use client";

import { useEffect, useRef, useState } from "react";
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
  const [shareLabel, setShareLabel] = useState("SHARE ARTHUR");
  const timeoutRef = useRef<number | null>(null);
  const stats = [
    ["Body size", state.body_size.toFixed(1)],
    ["Appendages", String(state.appendage_count)],
    ["Eyes", String(state.eye_count)],
    ["Tentacles", String(state.tentacle_count)],
    ["Pulse", state.pulse_rate.toFixed(2)],
    ["Glow", state.glow_intensity.toFixed(2)]
  ];

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleShare() {
    const url = "https://arthur8192.vercel.app/doma8192";

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setShareLabel("LINK COPIED");
    } catch {
      setShareLabel("COPY FAILED");
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setShareLabel("SHARE ARTHUR");
      timeoutRef.current = null;
    }, 2000);
  }

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
      <button className="panel-button" type="button" onClick={handleShare}>
        {shareLabel}
      </button>
    </aside>
  );
}
