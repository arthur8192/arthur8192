import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="initializing">INITIALIZING...</div>
        <div className="home-hero__content">
          <h1 className="glitch-title" data-text="ARTHUR">
            ARTHUR
          </h1>
          <p className="hero-subtitle">A synthetic lifeform growing on the internet.</p>
          <p className="hero-copy">
            Arthur8192 is a live synthetic-life experiment. Arthur begins as a primitive
            digital cell and evolves over time through a deterministic but unpredictable
            algorithm. Nobody knows what Arthur will become - not even its creator.
          </p>
          <div className="hero-actions">
            <Link className="primary-cta" href="/doma8192">
              VIEW ARTHUR
            </Link>
            <Link className="secondary-cta" href="/notes">
              READ THE EXPERIMENT
            </Link>
          </div>
        </div>
      </section>
      <section className="info-grid" aria-label="Experiment principles">
        <article>
          <h2>DETERMINISTIC</h2>
          <p>The same initial conditions. Every time.</p>
        </article>
        <article>
          <h2>UNPREDICTABLE</h2>
          <p>Too complex for any human to predict the outcome.</p>
        </article>
        <article>
          <h2>EVOLVING</h2>
          <p>Arthur changes. Every day. Nobody directs it.</p>
        </article>
      </section>
      <footer className="site-footer">arthur8192.com | a synthetic life experiment</footer>
    </main>
  );
}
