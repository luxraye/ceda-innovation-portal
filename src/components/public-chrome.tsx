import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
import { Logo } from "./logo";
import { getSession } from "@/lib/auth";
import { ROLE_INFO } from "@/lib/domain";
import { AzurePhoto } from "./photo";

const LINKS = [
  { href: "/calls", label: "Open calls" },
  { href: "/range", label: "The Range" },
  { href: "/events", label: "Events" },
  { href: "/#how", label: "How it works" },
  { href: "/tour", label: "Judge's guide" },
];

/** Public header. Sits on the night surface used across the public site. */
export async function PublicHeader() {
  const session = await getSession();
  return (
    <header className="relative z-30 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 md:px-8">
      <Logo dark />
      <nav
        className="hidden items-center gap-1 rounded-full bg-white/[0.04] p-1 text-[13px] ring-1 ring-white/10 backdrop-blur-md lg:flex"
        aria-label="Main"
      >
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-full px-3.5 py-1.5 text-white/65 transition hover:bg-white/[0.07] hover:text-white">
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <Link href="/leaderboard" className="btn-glass hidden lg:inline-flex">
          <Trophy className="h-3.5 w-3.5 text-sky-300" /> Leaderboard
        </Link>
        {session ? (
          <Link href={ROLE_INFO[session.role].home} className="btn-primary">
            Portal <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <>
            <Link href="/login" className="btn-quiet text-white/75 hover:bg-white/10 hover:text-white">Sign in</Link>
            <Link href="/register" className="btn-primary hidden sm:inline-flex">Join the Arena</Link>
          </>
        )}
      </div>
      <nav className="-mx-4 flex w-[calc(100%+2rem)] basis-full gap-1 overflow-x-auto px-4 text-[13px] lg:hidden" aria-label="Main (mobile)">
        {[{ href: "/leaderboard", label: "Leaderboard" }, ...LINKS].map((l) => (
          <Link key={l.href} href={l.href} className="shrink-0 rounded-full px-3 py-1.5 text-white/65 ring-1 ring-white/10">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="night relative overflow-hidden border-t border-white/[0.06]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-12 md:px-8">
        <div className="md:col-span-6">
          <Logo dark />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/55">
            Arena is a prototype of the CEDA Innovation Portal: a national range where youth-owned Botswana companies sharpen their ideas,
            climb a transparent Innovator Index, and bring their best work to CEDA calls.
          </p>
          <p className="mt-5 max-w-md text-xs leading-relaxed text-white/35">
            Built by Local Grow (Pty) Ltd (UIN BW00009995803) for the CEDA Innovation Portal Hackathon, November 2026. Not an official CEDA
            website. All people, companies and ideas shown are fictional demo data.
          </p>
        </div>
        <div className="md:col-span-3">
          <div className="eyebrow text-white/40">Portal</div>
          <ul className="mt-4 space-y-2.5 text-sm text-white/65">
            <li><Link href="/calls" className="hover:text-white">Open calls</Link></li>
            <li><Link href="/range" className="hover:text-white">The Range</Link></li>
            <li><Link href="/leaderboard" className="hover:text-white">Leaderboard</Link></li>
            <li><Link href="/events" className="hover:text-white">Events</Link></li>
            <li><Link href="/register" className="hover:text-white">Create an account</Link></li>
            <li><Link href="/tour" className="hover:text-white">Judge's guide</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy notice</Link></li>
            <li><Link href="/verify" className="hover:text-white">Verify a receipt</Link></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <div className="eyebrow text-white/40">CEDA programmes</div>
          <ul className="mt-4 space-y-2.5 text-sm text-white/65">
            <li>Citizen Entrepreneurial Development Agency</li>
            <li>Marang</li>
            <li>Katlego Ya Mogwebi</li>
            <li className="text-gold-400">#KaeKapaKae</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 border-t border-white/[0.06] px-4 py-6 text-xs text-white/35 md:flex-row md:px-8">
        <span>Finance · Develop · Sustain</span>
        <span className="font-mono">Protected under the Botswana Data Protection Act 2024</span>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none mx-auto -mb-[0.22em] max-w-7xl px-4 text-center text-[22vw] leading-none font-semibold tracking-[-0.06em] text-white/[0.035] select-none md:px-8 md:text-[15rem]"
      >
        Arena
      </div>
    </footer>
  );
}

/** Night hero band used at the top of every public page except the landing page. */
export async function PublicHero({
  eyebrow,
  title,
  body,
  children,
  narrow = false,
  photo,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  children?: React.ReactNode;
  narrow?: boolean;
  /** Optional background photo, shown in the Arena duotone on the right. */
  photo?: string;
}) {
  return (
    <section className="night noise relative isolate overflow-hidden">
      <div className="grid-lines absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_70%_at_75%_0%,rgb(10_168_92/0.28),transparent_70%)]"
        aria-hidden="true"
      />
      {photo && (
        <div className="absolute inset-y-0 right-0 -z-10 w-full md:w-[62%]" aria-hidden="true">
          <AzurePhoto src={photo} alt="" priority sizes="(min-width: 768px) 62vw, 100vw" className="absolute inset-0" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-navy-950)_0%,rgb(5_8_15/0.75)_35%,rgb(5_8_15/0.25)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/70" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" aria-hidden="true" />
      <PublicHeader />
      <div className={`mx-auto px-4 pt-10 pb-16 md:px-8 md:pt-14 md:pb-20 ${narrow ? "max-w-5xl" : "max-w-7xl"}`}>
        {eyebrow && <div className="eyebrow animate-rise text-sky-300/80">{eyebrow}</div>}
        <h1 className="animate-rise mt-4 max-w-4xl text-[40px] leading-[1.02] text-white [animation-delay:60ms] md:text-6xl">{title}</h1>
        {body && <p className="animate-rise mt-5 max-w-2xl text-lg leading-relaxed text-white/55 [animation-delay:120ms]">{body}</p>}
        {children && <div className="animate-rise [animation-delay:180ms]">{children}</div>}
      </div>
    </section>
  );
}
