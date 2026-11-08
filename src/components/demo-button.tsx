import { demoLogin } from "@/app/actions/auth";
import { cn } from "@/lib/format";

/** One-click sign-in as a seeded demo account, landing on a specific screen. Pass `plain` to style it fully yourself. */
export function DemoButton({ email, next, children, className, plain }: { email: string; next?: string; children: React.ReactNode; className?: string; plain?: boolean }) {
  if (process.env.DEMO_MODE !== "true") return null;
  return (
    <form action={demoLogin}>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="next" value={next ?? ""} />
      <button className={cn(plain || className?.includes("btn-") ? "" : "btn-primary", className)}>{children}</button>
    </form>
  );
}
