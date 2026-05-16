export type MutationLogItem = {
  day_number: number;
  event_type: string;
  description: string;
  recorded_at: string;
};

type MutationLogProps = {
  items: MutationLogItem[];
  onLoadMore?: () => void;
  isLoading?: boolean;
};

export function MutationLog({ items, onLoadMore, isLoading = false }: MutationLogProps) {
  return (
    <aside className="mutation-panel">
      <header>
        <h2>MUTATION LOG</h2>
      </header>
      <div className="mutation-panel__list">
        {items.length ? (
          items.map((item) => (
            <article key={`${item.day_number}-${item.recorded_at}`}>
              <b>Day {item.day_number}</b>
              <span>{item.event_type}</span>
              <p>{item.description}</p>
            </article>
          ))
        ) : (
          <p className="dim-copy">{isLoading ? "LOADING LOG..." : "NO SIGNAL RECORDED."}</p>
        )}
      </div>
      {onLoadMore ? (
        <button className="panel-button" type="button" onClick={onLoadMore} disabled={isLoading}>
          {isLoading ? "LOADING..." : "LOAD MORE..."}
        </button>
      ) : null}
    </aside>
  );
}
