import { createBrowserClient } from "@supabase/ssr";

type SupabaseBrowserConfig = {
  anonKey: string;
  url: string;
};

function getSupabaseBrowserConfig(): SupabaseBrowserConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url?.trim() || !anonKey?.trim()) {
    return null;
  }

  return {
    anonKey,
    url
  };
}

export function createSupabaseBrowserClient() {
  const config = getSupabaseBrowserConfig();

  if (!config) {
    return null;
  }

  return createBrowserClient(
    config.url,
    config.anonKey
  );
}

export function getSupabaseBrowserConfigError() {
  return getSupabaseBrowserConfig()
    ? null
    : "Supabase public configuration is unavailable in this deployment. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.";
}
