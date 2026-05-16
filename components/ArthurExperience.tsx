"use client";

import { useEffect, useMemo, useState } from "react";
import { CommandPanel } from "./CommandPanel";
import { MutationLog, type MutationLogItem } from "./MutationLog";
import { StatPanel } from "./StatPanel";
import { Vivarium } from "./Vivarium";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import type { ArthurState, Genome } from "@/lib/types";

type ArthurPayload = {
  arthur: {
    id: string;
    username: string;
    day_number: number;
    is_alive: boolean;
    birth_timestamp: string;
    state: ArthurState;
    genome: Genome;
  };
};

function PanelSkeleton() {
  return (
    <div className="skeleton-panel">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function LoadingOrganism() {
  return (
    <div className="organism-loading">
      <span>LOADING ORGANISM...</span>
    </div>
  );
}

function isCreatorUser(userId: string | undefined) {
  const creatorUserId = process.env.NEXT_PUBLIC_CREATOR_USER_ID?.trim();

  return Boolean(creatorUserId && userId === creatorUserId);
}

export function ArthurExperience() {
  const [payload, setPayload] = useState<ArthurPayload | null>(null);
  const [log, setLog] = useState<MutationLogItem[]>([]);
  const [logOffset, setLogOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogLoading, setIsLogLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [toast, setToast] = useState("");

  const stateFingerprint = useMemo(
    () => (payload ? JSON.stringify(payload.arthur.state) : ""),
    [payload]
  );

  async function fetchArthur(showToast = false) {
    const response = await fetch("/api/arthur/doma8192", { cache: "no-store" });

    if (!response.ok) {
      setError(true);
      setIsLoading(false);
      return;
    }

    const nextPayload = (await response.json()) as ArthurPayload;
    setPayload((current) => {
      if (showToast && current) {
        const currentState = JSON.stringify(current.arthur.state);
        const nextState = JSON.stringify(nextPayload.arthur.state);
        if (currentState !== nextState) {
          setToast("Arthur has changed.");
          window.setTimeout(() => setToast(""), 4000);
        }
      }
      return nextPayload;
    });
    setError(false);
    setIsLoading(false);
  }

  async function fetchLog(nextOffset = logOffset) {
    setIsLogLoading(true);
    const response = await fetch(`/api/log/doma8192?limit=10&offset=${nextOffset}`, {
      cache: "no-store"
    });
    const next = response.ok ? await response.json() : { log: [] };
    const items = next.log ?? [];
    setLog((current) => (nextOffset === 0 ? items : [...current, ...items]));
    setLogOffset(nextOffset + items.length);
    setIsLogLoading(false);
  }

  useEffect(() => {
    fetchArthur();
    fetchLog(0);
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setIsCreator(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setIsCreator(isCreatorUser(data.session?.user.id));
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsCreator(isCreatorUser(session?.user.id));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchArthur(true);
      fetchLog(0);
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [stateFingerprint]);

  if (error) {
    return (
      <main className="arthur-page-shell">
        <section className="signal-lost">
          <h1>SIGNAL LOST. ATTEMPTING RECONNECT...</h1>
          <button type="button" onClick={() => fetchArthur()}>
            RETRY
          </button>
        </section>
      </main>
    );
  }

  if (isLoading || !payload) {
    return (
      <main className="arthur-page-shell">
        <div className="arthur-grid">
          <PanelSkeleton />
          <LoadingOrganism />
          <PanelSkeleton />
        </div>
      </main>
    );
  }

  const { arthur } = payload;

  return (
    <main className="arthur-page-shell">
      {toast ? <div className="state-toast">{toast}</div> : null}
      <section className="mobile-specimen-strip">
        <span>SPECIMEN: ARTHUR</span>
        <span>AGE: {arthur.state.day_number} DAYS</span>
      </section>
      <div className="arthur-grid">
        <StatPanel state={arthur.state} />
        <div className="arthur-center">
          <Vivarium state={arthur.state} genome={arthur.genome} />
          <div className="mobile-behavior-strip">
            <span>STATUS: {arthur.state.behavior_state.toUpperCase()}</span>
            <span>STAGE: {arthur.state.stage}/6</span>
          </div>
        </div>
        <MutationLog
          items={log}
          isLoading={isLogLoading}
          onLoadMore={() => fetchLog(logOffset)}
        />
      </div>
      {isCreator ? <CommandPanel arthurId={arthur.id} /> : null}
    </main>
  );
}
