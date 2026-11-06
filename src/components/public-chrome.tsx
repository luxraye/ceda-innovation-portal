import Link from "next/link";
import { Logo } from "./logo";
import { getSession } from "@/lib/auth";
import { ROLE_INFO } from "@/lib/domain";

export async function PublicHeader({ dark = false }: { dark?: boolean }) {
  const session = await getSession();
  const link = dark ? "text-sky-100 hover:text-white" : "text-slate-600 hover:text-sky-700";
  return (
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 md:px-8">
      <Logo dark={dark} />
      <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Main">
        <Link href="/#how" className={link}>How it works</Link>
        <Link href="/calls" className={link}>Open calls</Link>
        <Link href="/#trust" className={link}>Your data</Link>
        <Link href="/tour" className={link}>Judge's guide</Link>
      </nav>
      <div className="flex items-center gap-2">
        {session ? (
          <Link href={ROLE_INFO[session.role].home} className="btn-primary">My workspace</Link>
        ) : (
          <>
            <Link href="/login" className={dark ? "btn text-white hover:bg-white/10" : "btn-ghost"}>Sign in</Link>
            <Link href="/register" className="btn-primary hidden sm:inline-flex">Apply now</Link>
          </>
        )}
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="night-gradient text-sky-100/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <Logo dark />
          <p className="mt-4 max-w-md text-sm">
            Sky is a prototype of the CEDA Innovation Portal, where youth-owned Botswana companies bring ideas forward and CEDA
            evaluates, tracks and rewards them in the open.
          </p>
          <p className="mt-4 text-xs text-sky-100/60">
            Built by Local Grow (Pty) Ltd (UIN BW00009995803) for the CEDA Innovation Portal Hackathon, November 2026. Not an
            official CEDA website. All people, companies and ideas shown are fictional demo data.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Portal</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/calls" className="hover:text-white">Open calls</Link></li>
            <li><Link href="/register" className="hover:text-white">Create an account</Link></li>
            <li><Link href="/tour" className="hover:text-white">Judge's guide</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy notice</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">CEDA programmes</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Citizen Entrepreneurial Development Agency</li>
            <li>Marang</li>
            <li>Katlego Ya Mogwebi</li>
            <li className="text-gold-300">#KaeKapaKae</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-sky-100/50">Finance · Develop · Sustain</div>
    </footer>
  );
}
