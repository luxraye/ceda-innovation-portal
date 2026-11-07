import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Save, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, Empty } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { initials, timeAgo, useCriteria, useProfiles, type Criterion } from "@/lib/data";
import type { AppRole } from "@/lib/stages";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administration — CEDA Innovation Portal" }] }),
  component: Admin,
});

function Admin() {
  const { roles } = useAuth();
  if (!roles.includes("admin")) {
    return (
      <AppShell title="Administration">
        <Empty
          title="Administrators only"
          body="This area manages people, roles and scoring criteria."
        />
      </AppShell>
    );
  }
  return (
    <AppShell title="Administration" subtitle="Manage who does what, and how ideas are scored.">
      <Tabs defaultValue="people">
        <TabsList>
          <TabsTrigger value="people">People & roles</TabsTrigger>
          <TabsTrigger value="criteria">Scoring criteria</TabsTrigger>
        </TabsList>
        <TabsContent value="people">
          <People />
        </TabsContent>
        <TabsContent value="criteria">
          <CriteriaEditor />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

const ROLES: { role: AppRole; label: string; hint: string }[] = [
  { role: "evaluator", label: "Evaluator", hint: "Screens and scores ideas" },
  { role: "adjudicator", label: "Adjudicator", hint: "Approves and awards" },
  { role: "admin", label: "Admin", hint: "Full control" },
];

function People() {
  const { user, refreshRoles } = useAuth();
  const { data: people, isLoading } = useProfiles();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const { data: allRoles } = useQuery({
    queryKey: ["all-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id, role");
      if (error) throw error;
      return data;
    },
  });

  const has = (uid: string, r: AppRole) =>
    (allRoles ?? []).some((x) => x.user_id === uid && x.role === r);

  const toggle = async (uid: string, role: AppRole, grant: boolean) => {
    if (uid === user?.id && role === "admin" && !grant) {
      toast.error("You can't remove your own admin role.");
      return;
    }
    setPending(uid + role);
    const { error } = await supabase.rpc("set_user_role", {
      _user_id: uid,
      _role: role,
      _grant: grant,
    });
    setPending(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${grant ? "Granted" : "Removed"} ${role}`);
    qc.invalidateQueries({ queryKey: ["all-roles"] });
    if (uid === user?.id) refreshRoles();
  };

  const term = q.trim().toLowerCase();
  const list = (people ?? []).filter(
    (p) =>
      !term || [p.full_name, p.email, p.company_name].some((v) => v?.toLowerCase().includes(term)),
  );

  if (isLoading) return <Skeleton className="h-72 rounded-2xl" />;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search people"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <ul className="divide-y">
          {list.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <span className="grid size-10 place-items-center rounded-full bg-secondary text-sm font-bold">
                {initials(p.full_name ?? p.email)}
              </span>
              <div className="min-w-[180px] flex-1">
                <p className="font-semibold">
                  {p.full_name ?? "—"}{" "}
                  {p.id === user?.id && (
                    <span className="text-xs text-muted-foreground">(you)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.email} · joined {timeAgo(p.created_at)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => {
                  const on = has(p.id, r.role);
                  return (
                    <button
                      key={r.role}
                      title={r.hint}
                      disabled={pending === p.id + r.role}
                      onClick={() => toggle(p.id, r.role, !on)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                        on
                          ? "border-transparent bg-ink text-ink-foreground"
                          : "text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      {pending === p.id + r.role ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <span
                          className={cn("size-1.5 rounded-full", on ? "bg-primary" : "bg-border")}
                        />
                      )}
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
          {!list.length && <li className="p-6 text-sm text-muted-foreground">No people found.</li>}
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">
        Everyone who signs up is an innovator by default. The very first account becomes the
        administrator.
      </p>
    </div>
  );
}

function CriteriaEditor() {
  const { data, isLoading, refetch } = useCriteria();
  const [rows, setRows] = useState<Criterion[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const total = rows.filter((r) => r.active).reduce((a, r) => a + Number(r.weight || 0), 0);
  const set = (id: string, patch: Partial<Criterion>) =>
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const saveAll = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("criteria")
      .upsert(
        rows.map(({ id, name, description, weight, max_score, active, sort }) => ({
          id,
          name,
          description,
          weight,
          max_score,
          active,
          sort,
        })),
      );
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Criteria saved");
    refetch();
  };

  const add = async () => {
    const { error } = await supabase
      .from("criteria")
      .insert({
        name: "New criterion",
        description: "",
        weight: 0,
        max_score: 10,
        sort: rows.length + 1,
      });
    if (error) {
      toast.error(error.message);
      return;
    }
    refetch();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("criteria").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refetch();
  };

  if (isLoading) return <Skeleton className="h-72 rounded-2xl" />;

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm",
          total === 100 ? "border-success/40 bg-success/10" : "border-primary/50 bg-primary/10",
        )}
      >
        <span>
          Active weights add up to <b>{total}%</b>
          {total !== 100 && ". Aim for 100% so scores are easy to compare."}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={add}>
            <Plus /> Add criterion
          </Button>
          <Button variant="hero" size="sm" onClick={saveAll} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Save />} Save changes
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className={cn(
              "grid gap-3 rounded-2xl border bg-card p-4 shadow-card md:grid-cols-[1fr_1.4fr_90px_90px_auto_auto] md:items-center",
              !r.active && "opacity-60",
            )}
          >
            <Input
              value={r.name}
              onChange={(e) => set(r.id, { name: e.target.value })}
              aria-label="Name"
            />
            <Input
              value={r.description}
              onChange={(e) => set(r.id, { description: e.target.value })}
              placeholder="What evaluators look for"
              aria-label="Description"
            />
            <label className="flex items-center gap-1 text-sm">
              <Input
                type="number"
                min={0}
                max={100}
                value={r.weight}
                onChange={(e) => set(r.id, { weight: Number(e.target.value) })}
                aria-label="Weight"
              />
              %
            </label>
            <label className="flex items-center gap-1 text-xs text-muted-foreground">
              /
              <Input
                type="number"
                min={1}
                max={100}
                value={r.max_score}
                onChange={(e) => set(r.id, { max_score: Math.max(1, Number(e.target.value)) })}
                aria-label="Max score"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={r.active} onCheckedChange={(v) => set(r.id, { active: v })} /> Active
            </label>
            <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Delete">
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
