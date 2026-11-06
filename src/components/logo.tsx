import Link from "next/link";
import { cn } from "@/lib/format";

export function SkyMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden="true">
      <defs>
        <linearGradient id="sky-mark-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#36a6ff" />
          <stop offset="1" stopColor="#0062cc" />
        </linearGradient>
        <linearGradient id="sky-mark-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fcd38a" />
          <stop offset="1" stopColor="#f29a1f" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#sky-mark-bg)" />
      <circle cx="20" cy="25" r="8" fill="url(#sky-mark-sun)" />
      <path d="M6 27h28" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M10 31.5h20" stroke="#fff" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 9v4M10.5 13l2.6 2.6M29.5 13l-2.6 2.6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ dark = false, href = "/" }: { dark?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="Sky, the CEDA Innovation Portal, home">
      <SkyMark />
      <span className="leading-none">
        <span className={cn("font-display block text-xl font-bold", dark ? "text-white" : "text-navy-900")}>Sky</span>
        <span className={cn("block text-[10.5px] font-medium tracking-wide uppercase", dark ? "text-sky-200" : "text-sky-700")}>
          CEDA Innovation Portal
        </span>
      </span>
    </Link>
  );
}
