import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { IdeaForm, emptyIdea } from "@/components/IdeaForm";

export const Route = createFileRoute("/ideas/new")({
  head: () => ({ meta: [{ title: "New idea — CEDA Innovation Portal" }] }),
  component: NewIdea,
});

function NewIdea() {
  return (
    <AppShell
      title="Submit an idea"
      subtitle="Fields marked * are mandatory. Save a draft at any time and come back later."
    >
      <IdeaForm initial={emptyIdea} />
    </AppShell>
  );
}
