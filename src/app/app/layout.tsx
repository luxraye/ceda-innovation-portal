import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole();
  return <AppShell user={user}>{children}</AppShell>;
}
