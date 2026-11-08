import Link from "next/link";
import { cn } from "@/lib/format";

/** Arena mark: three rising rank bars inside a range target, with a gold award point. */
export function ArenaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id="arm-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#13203a" />
          <stop offset="1" stopColor="#050912" />
        </linearGradient>
        <linearGradient id="arm-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ff7c0" />
          <stop offset="1" stopColor="#17cf74" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8.5" fill="url(#arm-bg)" />
      <rect x=".5" y=".5" width="31" height="31" rx="8" fill="none" stroke="#39e58c" strokeOpacity=".28" />
      <circle cx="16" cy="16" r="10.5" fill="none" stroke="#39e58c" strokeOpacity=".22" strokeDasharray="2 2.4" />
      <rect x="9" y="17" width="3.6" height="6.5" rx="1" fill="url(#arm-bar)" opacity=".55" />
      <rect x="14.2" y="13" width="3.6" height="10.5" rx="1" fill="url(#arm-bar)" opacity=".8" />
      <rect x="19.4" y="9" width="3.6" height="14.5" rx="1" fill="url(#arm-bar)" />
      <circle cx="21.2" cy="6.2" r="1.5" fill="#efc06a" />
    </svg>
  );
}
/** Kept for screens that still import the old name. */
export const SkyMark = ArenaMark;

export function Logo({ dark = false, href = "/", compact = false }: { dark?: boolean; href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="group flex items-center gap-2.5" aria-label="Arena, the CEDA Innovation Portal, home">
      <ArenaMark className="transition-transform duration-300 group-hover:scale-105" />
      <span className="leading-none">
        <span className={cn("block text-[17px] font-semibold tracking-[-0.03em]", dark ? "text-white" : "text-navy-950")}>
          Arena<span className="text-sky-400">.</span>
        </span>
        {!compact && (
          <span className={cn("mt-0.5 block font-mono text-[9.5px] tracking-[0.16em] uppercase", dark ? "text-white/45" : "text-slate-500")}>
            CEDA Innovation Range
          </span>
        )}
      </span>
    </Link>
  );
}
