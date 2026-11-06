import Link from "next/link";
import { cn } from "@/lib/format";

/** Sky mark: a sun rising over the horizon, with the dawn star. */
export function SkyMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id="skm-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#16213a" />
          <stop offset="1" stopColor="#05080f" />
        </linearGradient>
        <linearGradient id="skm-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bcd9ff" />
          <stop offset=".55" stopColor="#2e86ff" />
          <stop offset="1" stopColor="#0f6fff" />
        </linearGradient>
        <clipPath id="skm-clip">
          <rect x="0" y="0" width="32" height="20.5" />
        </clipPath>
      </defs>
      <rect width="32" height="32" rx="8.5" fill="url(#skm-bg)" />
      <rect x=".5" y=".5" width="31" height="31" rx="8" fill="none" stroke="#fff" strokeOpacity=".12" />
      <circle cx="16" cy="21" r="8.5" fill="url(#skm-sun)" clipPath="url(#skm-clip)" />
      <path d="M6.5 21h19" stroke="#e7f0ff" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 24.6h12" stroke="#e7f0ff" strokeOpacity=".45" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="23.6" cy="8.4" r="1.6" fill="#efc06a" />
    </svg>
  );
}

export function Logo({ dark = false, href = "/", compact = false }: { dark?: boolean; href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="group flex items-center gap-2.5" aria-label="Sky, the CEDA Innovation Portal, home">
      <SkyMark className="transition-transform duration-300 group-hover:-rotate-6" />
      <span className="leading-none">
        <span className={cn("block text-[17px] font-semibold tracking-[-0.03em]", dark ? "text-white" : "text-navy-950")}>Sky</span>
        {!compact && (
          <span className={cn("mt-0.5 block font-mono text-[9.5px] tracking-[0.16em] uppercase", dark ? "text-white/45" : "text-slate-500")}>
            CEDA Innovation Portal
          </span>
        )}
      </span>
    </Link>
  );
}
