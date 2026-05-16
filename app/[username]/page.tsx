import type { Metadata } from "next";
import { ArthurExperience } from "@/components/ArthurExperience";
import { createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type ArthurPageProps = {
  params: {
    username: string;
  };
};

export async function generateMetadata({ params }: ArthurPageProps): Promise<Metadata> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: arthur } = await supabase
      .from("arthurs")
      .select("id")
      .eq("username", params.username)
      .single();

    if (!arthur) {
      return {
        title: "Arthur · Signal Pending",
        description: "Arthur's current state has not been acquired."
      };
    }

    const [{ data: state }, { data: latestMutation }] = await Promise.all([
      supabase
        .from("arthur_state")
        .select("day_number")
        .eq("arthur_id", arthur.id)
        .single(),
      supabase
        .from("mutation_log")
        .select("description")
        .eq("arthur_id", arthur.id)
        .eq("is_public", true)
        .order("day_number", { ascending: false })
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);

    const day = state?.day_number ?? 1;
    const description =
      latestMutation?.description ??
      "Arthur is online. Current mutation signal is still stabilizing.";

    return {
      title: `Arthur · Day ${day}`,
      description,
      openGraph: {
        title: `Arthur · Day ${day}`,
        description,
        url: `https://arthur8192.com/${params.username}`,
        siteName: "Arthur8192",
        type: "website"
      },
      twitter: {
        card: "summary",
        title: `Arthur · Day ${day}`,
        description
      }
    };
  } catch {
    return {
      title: "Arthur · Signal Pending",
      description: "Arthur's current state has not been acquired."
    };
  }
}

export default async function ArthurPage() {
  return <ArthurExperience />;
}
