import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";

export type Idea = Tables<"ideas">;
export type IdeaEvent = Tables<"idea_events">;
export type Criterion = Tables<"criteria">;
export type Score = Tables<"scores">;
export type Feedback = Tables<"feedback">;
export type Profile = Tables<"profiles">;

function must<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

/** All ideas the current user can see (own ideas for submitters, everything for staff). */
export function useIdeas() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ideas", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(await supabase.from("ideas").select("*").order("updated_at", { ascending: false })),
  });
}

export function useIdea(id: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["idea", id],
    enabled: !!user,
    queryFn: async (): Promise<Idea | null> => {
      const { data, error } = await supabase.from("ideas").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useEvents(ideaId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["events", ideaId ?? "all"],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase
        .from("idea_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(ideaId ? 200 : 25);
      if (ideaId) q = q.eq("idea_id", ideaId);
      return must(await q);
    },
  });
}

export function useFeedback(ideaId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["feedback", ideaId],
    enabled: !!user,
    queryFn: async () =>
      must(
        await supabase
          .from("feedback")
          .select("*")
          .eq("idea_id", ideaId)
          .order("created_at", { ascending: true }),
      ),
  });
}

export function useCriteria() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["criteria"],
    enabled: !!user,
    queryFn: async () => must(await supabase.from("criteria").select("*").order("sort")),
  });
}

export function useScores(ideaId?: string, enabled = true) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["scores", ideaId ?? "all"],
    enabled: !!user && enabled,
    queryFn: async () => {
      let q = supabase.from("scores").select("*");
      if (ideaId) q = q.eq("idea_id", ideaId);
      return must(await q);
    },
  });
}

export function useProfiles(enabled = true) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profiles"],
    enabled: !!user && enabled,
    queryFn: async () =>
      must(await supabase.from("profiles").select("*").order("created_at", { ascending: false })),
  });
}

/** Keeps cached queries fresh when ideas, events or feedback change anywhere. */
export function useLiveUpdates(channel: string, filter?: { ideaId?: string }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    const f = filter?.ideaId;
    const ch = supabase
      .channel(`${channel}-${f ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ideas", ...(f ? { filter: `id=eq.${f}` } : {}) },
        () => {
          qc.invalidateQueries({ queryKey: ["ideas"] });
          if (f) qc.invalidateQueries({ queryKey: ["idea", f] });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "idea_events",
          ...(f ? { filter: `idea_id=eq.${f}` } : {}),
        },
        () => {
          qc.invalidateQueries({ queryKey: ["events"] });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "feedback",
          ...(f ? { filter: `idea_id=eq.${f}` } : {}),
        },
        () => {
          if (f) qc.invalidateQueries({ queryKey: ["feedback", f] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [channel, filter?.ideaId, user, qc]);
}

export function timeAgo(iso: string | null | undefined) {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-BW", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function initials(name?: string | null) {
  return (name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
