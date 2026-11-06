import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ROLE_INFO, type Role } from "@/lib/domain";
import { Callout } from "@/components/ui";
import Link from "next/link";

export default async function AppHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireRole();
  const { denied } = await searchParams;
  if (!denied) redirect(ROLE_INFO[user.role as Role].home);
  return (
    <div className="max-w-xl">
      <Callout tone="rose" title="That area is for another role">
        Sky checks your role on every page. As a {ROLE_INFO[user.role as Role].label.toLowerCase()} you can't open that screen.
        The attempt was recorded in the audit trail.
      </Callout>
      <Link href={ROLE_INFO[user.role as Role].home} className="btn-primary mt-4">
        Back to my workspace
      </Link>
    </div>
  );
}
