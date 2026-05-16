import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arthur8192",
  description: "A live synthetic-life experiment."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  let isAuthenticated = false;

  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    isAuthenticated = Boolean(data.user);
  } catch {
    isAuthenticated = false;
  }

  return (
    <html lang="en">
      <body>
        <Navigation isAuthenticated={isAuthenticated} />
        {children}
      </body>
    </html>
  );
}
