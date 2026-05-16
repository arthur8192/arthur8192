"use client";

import { useEffect, useState } from "react";

type MutationLogItem = {
  day_number: number;
  event_type: string;
  description: string;
  recorded_at: string;
};

const sections = [
  "PROJECT THESIS",
  "GENESIS ALGORITHM",
  "KNOWN TRAITS",
  "MUTATION HISTORY",
  "CHANGELOG"
];

export function FieldNotesClient() {
  const [openToc, setOpenToc] = useState(false);
  const [log, setLog] = useState<MutationLogItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  async function loadMore(nextOffset = offset) {
    setIsLoading(true);
    const response = await fetch(`/api/log/doma8192?limit=10&offset=${nextOffset}`);
    const payload = response.ok ? await response.json() : { log: [] };
    const nextItems = payload.log ?? [];
    setLog((current) => (nextOffset === 0 ? nextItems : [...current, ...nextItems]));
    setOffset(nextOffset + nextItems.length);
    setHasMore(nextItems.length === 10);
    setIsLoading(false);
  }

  useEffect(() => {
    loadMore(0);
  }, []);

  return (
    <div className="notes-layout">
      <aside className="notes-toc">
        <button
          className="notes-toc__toggle"
          type="button"
          onClick={() => setOpenToc((value) => !value)}
        >
          FIELD INDEX
        </button>
        <nav className={openToc ? "notes-toc__links is-open" : "notes-toc__links"}>
          {sections.map((section) => (
            <a key={section} href={`#${section.toLowerCase().replaceAll(" ", "-")}`}>
              {section}
            </a>
          ))}
        </nav>
      </aside>
      <main className="notes-content">
        <section id="project-thesis">
          <h1>PROJECT THESIS</h1>
          <p>
            Project Arthur is a live synthetic-life experiment. Its central question is
            whether a deterministic system can feel alive when its future remains too
            complex to predict.
          </p>
        </section>
        <section id="genesis-algorithm">
          <h2>GENESIS ALGORITHM</h2>
          <pre>{`Seed + Username + Timestamp\n        |\n        v\nSHA-256 Hash -> Genesis Genome\n        |\n        v\nDaily Chaos Step -> Trait State -> Canvas Render`}</pre>
        </section>
        <section id="known-traits">
          <h2>KNOWN TRAITS</h2>
          <p>
            Arthur exposes only observable traits: body mass, movement, sensory
            structures, glow, texture, and behavior state. Hidden genome values remain
            undisclosed to preserve uncertainty.
          </p>
        </section>
        <section id="mutation-history">
          <h2>MUTATION HISTORY</h2>
          <div className="notes-log">
            {log.length ? (
              log.map((item) => (
                <article key={`${item.day_number}-${item.recorded_at}`}>
                  <b>DAY {item.day_number}</b>
                  <span>{item.event_type.toUpperCase()}</span>
                  <p>{item.description}</p>
                </article>
              ))
            ) : (
              <p className="dim-copy">{isLoading ? "LOADING MUTATION HISTORY..." : "NO PUBLIC MUTATIONS RECORDED."}</p>
            )}
          </div>
          {hasMore ? (
            <button className="panel-button" type="button" onClick={() => loadMore()} disabled={isLoading}>
              {isLoading ? "LOADING..." : "LOAD MORE"}
            </button>
          ) : null}
        </section>
        <section id="changelog">
          <h2>CHANGELOG</h2>
          <p>
            Field notes will be expanded manually as the experiment develops and new
            observations become worth preserving.
          </p>
        </section>
      </main>
    </div>
  );
}
