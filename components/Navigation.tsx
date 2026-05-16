"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

type NavigationProps = {
  isAuthenticated?: boolean;
};

export function Navigation({ isAuthenticated = false }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const authControl = isAuthenticated ? (
    <button className="nav-link nav-button" type="button" onClick={handleLogout}>
      LOGOUT
    </button>
  ) : (
    <Link className="nav-link" href="/login">
      LOGIN
    </Link>
  );

  return (
    <header className="site-nav">
      <Link className="site-nav__brand" href="/">
        arthur8192.com
      </Link>
      <nav className="site-nav__links" aria-label="Primary navigation">
        <Link className="nav-link" href="/notes">
          FIELD NOTES
        </Link>
        <Link className="nav-link" href="/about">
          ABOUT
        </Link>
        {authControl}
      </nav>
      <button
        className="site-nav__menu"
        type="button"
        aria-label="Open navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        ☰
      </button>
      {isOpen ? (
        <div className="mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            className="mobile-nav__close"
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
          <Link onClick={() => setIsOpen(false)} href="/notes">
            FIELD NOTES
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/about">
            ABOUT
          </Link>
          {isAuthenticated ? (
            <button type="button" onClick={handleLogout}>
              LOGOUT
            </button>
          ) : (
            <Link onClick={() => setIsOpen(false)} href="/login">
              LOGIN
            </Link>
          )}
        </div>
      ) : null}
    </header>
  );
}
