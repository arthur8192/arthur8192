import { ArthurCanvas } from "./ArthurCanvas";
import type { ArthurState, Genome } from "@/lib/types";

type VivariumProps = {
  state: ArthurState;
  genome: Genome;
};

export function Vivarium({ state, genome }: VivariumProps) {
  return (
    <section className="arthur-vivarium" aria-label="Arthur vivarium">
      <div className="arthur-vivarium__corner arthur-vivarium__corner--tl" />
      <div className="arthur-vivarium__corner arthur-vivarium__corner--tr" />
      <div className="arthur-vivarium__corner arthur-vivarium__corner--bl" />
      <div className="arthur-vivarium__corner arthur-vivarium__corner--br" />
      <div className="arthur-vivarium__chamber">
        <ArthurCanvas state={state} genome={genome} />
      </div>
      <div className="arthur-vivarium__status" role="status">
        <span>
          <strong>AGE</strong>
          <b>DAY {state.day_number}</b>
        </span>
        <span>
          <strong>BEHAVIOR</strong>
          <b>{state.behavior_state.toUpperCase()}</b>
        </span>
      </div>
    </section>
  );
}
