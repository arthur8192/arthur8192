"use client";

import { useEffect, useMemo, useState } from "react";
import { STIMULI_EFFECTS, type StimulusType } from "@/lib/stimuli";

type CommandPanelProps = {
  arthurId: string;
};

type Tab = "RESOURCES" | "ENVIRONMENT" | "OBSERVATION" | "INTERACTION";

const tabStimuli: Record<Tab, StimulusType[]> = {
  RESOURCES: [
    "feed_water",
    "introduce_carbon",
    "introduce_nitrogen",
    "introduce_oxygen",
    "unknown_nutrient"
  ],
  ENVIRONMENT: ["expose_light", "trigger_darkness", "increase_warmth", "lower_temperature"],
  OBSERVATION: ["scan", "probe", "observe"],
  INTERACTION: ["play_sound"]
};

function commandLabel(stimulusType: string) {
  return stimulusType.replaceAll("_", " ").toUpperCase();
}

function midnightUtcCountdown() {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  const diff = Math.max(0, next.getTime() - now.getTime());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return `${hours}H ${minutes}M`;
}

export function CommandPanel({ arthurId }: CommandPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("RESOURCES");
  const [remaining, setRemaining] = useState(3);
  const [modalStimulus, setModalStimulus] = useState<StimulusType | null>(null);
  const [queuedStimulus, setQueuedStimulus] = useState<StimulusType | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const countdown = useMemo(() => midnightUtcCountdown(), [remaining]);

  async function refreshLimit() {
    const response = await fetch("/api/stimuli", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const payload = await response.json();
    setRemaining(payload.remaining ?? 0);
  }

  useEffect(() => {
    refreshLimit();
  }, []);

  async function confirmStimulus() {
    if (!modalStimulus) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    const response = await fetch("/api/stimuli", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        arthur_id: arthurId,
        stimulus_type: modalStimulus
      })
    });

    if (!response.ok) {
      setError("COMMAND REJECTED");
      setIsSubmitting(false);
      setModalStimulus(null);
      await refreshLimit();
      return;
    }

    setQueuedStimulus(modalStimulus);
    setRemaining((value) => Math.max(0, value - 1));
    setIsSubmitting(false);
    setModalStimulus(null);
    window.setTimeout(() => setQueuedStimulus(null), 2400);
  }

  return (
    <section className="command-panel" aria-label="Creator command panel">
      <header>
        <h2>COMMAND PANEL</h2>
        <span>STIMULI REMAINING: {remaining}/3</span>
      </header>
      <div className="command-tabs" role="tablist" aria-label="Stimulus categories">
        {(Object.keys(tabStimuli) as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? "is-active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {remaining <= 0 ? (
        <p className="command-panel__limit">
          DAILY LIMIT REACHED. NEXT CYCLE IN: {countdown}
        </p>
      ) : null}
      <div className="command-grid">
        {tabStimuli[activeTab].map((stimulusType) => {
          const stimulus = STIMULI_EFFECTS[stimulusType];
          const isQueued = queuedStimulus === stimulusType;
          return (
            <button
              key={stimulusType}
              type="button"
              disabled={remaining <= 0 || isSubmitting}
              onClick={() => setModalStimulus(stimulusType)}
            >
              <b>{isQueued ? "QUEUED" : commandLabel(stimulusType)}</b>
              <span>{stimulus.category.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
      {queuedStimulus ? (
        <p className="command-panel__feedback">
          {commandLabel(queuedStimulus)} queued. Arthur&apos;s response is unknown.
        </p>
      ) : null}
      {error ? <p className="signal-error">{error}</p> : null}
      {modalStimulus ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="confirm-modal">
            <h3>CONFIRM STIMULUS</h3>
            <p>
              This action will be queued. Arthur&apos;s response will manifest at the
              next evolution cycle. Proceed?
            </p>
            <div>
              <button type="button" onClick={() => setModalStimulus(null)}>
                CANCEL
              </button>
              <button type="button" onClick={confirmStimulus} disabled={isSubmitting}>
                {isSubmitting ? "QUEUING..." : "PROCEED"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
