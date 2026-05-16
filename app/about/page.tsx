export default function AboutPage() {
  return (
    <main className="editorial-page">
      <section>
        <h1>THE QUESTION</h1>
        <p>
          What makes a digital organism feel alive? Project Arthur begins with a
          simple tension: the system is deterministic, but the result should remain
          strange enough that observation feels meaningful.
        </p>
      </section>
      <section>
        <h2>THE ORGANISM</h2>
        <p>
          Arthur is a synthetic alien lifeform. It is not a pet, a game character,
          or a chatbot. It is a specimen whose visible body and behavior emerge from
          stored traits, daily change, and accumulated history.
        </p>
      </section>
      <section>
        <h2>THE ALGORITHM</h2>
        <p>
          The algorithm turns a seed, username, and birth timestamp into a stable
          genome. A daily chaos step nudges Arthur forward, applying queued stimuli
          without allowing the creator to directly command the outcome.
        </p>
        <pre>{`Seed + Username + Timestamp\n        |\n        v\nSHA-256 Hash\n        |\n        v\nGenesis Genome\n        |\n        v\nDaily Evolution Step\n        |\n        v\nVisible Arthur State`}</pre>
      </section>
      <section>
        <h2>THE EXPERIMENT</h2>
        <p>
          The experiment is not whether Arthur is alive in a biological sense. The
          experiment is whether long-term observation, coherent unpredictability, and
          small visible changes can create attachment to something synthetic.
        </p>
      </section>
    </main>
  );
}
