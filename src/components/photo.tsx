"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/** A photo in Sky's azure duotone. It warms to full colour on hover. */
export function AzurePhoto({
  src,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority,
  vivid,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  vivid?: boolean;
}) {
  return (
    <span className={`azure-photo block ${vivid ? "is-vivid" : ""} ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </span>
  );
}

type Story = { src: string; kicker: string; title: string; body: string };

/** Horizontal accordion of photo stories. Hover, focus or tap opens one. */
export function StoryGallery({ stories }: { stories: Story[] }) {
  const [open, setOpen] = useState(1);
  return (
    <div className="flex h-[480px] flex-col gap-3 md:flex-row" role="list">
      {stories.map((s, i) => {
        const active = i === open;
        return (
          <button
            key={s.title}
            type="button"
            role="listitem"
            aria-expanded={active}
            onMouseEnter={() => setOpen(i)}
            onFocus={() => setOpen(i)}
            onClick={() => setOpen(i)}
            className="group relative min-h-[96px] overflow-hidden rounded-2xl text-left ring-1 ring-white/10 transition-[flex-grow] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
            style={{ flexGrow: active ? 4 : 1, flexBasis: 0 }}
          >
            <AzurePhoto src={s.src} alt={s.title} vivid={active} sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0" />
            <span className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <span className="eyebrow text-gold-300">{s.kicker}</span>
              <span className={`mt-1.5 block font-medium tracking-tight text-white transition-all duration-500 ${active ? "text-2xl" : "truncate text-base"}`}>
                {s.title}
              </span>
              <span
                className={`block max-w-md overflow-hidden text-sm leading-relaxed text-white/70 transition-all duration-500 ${active ? "mt-2 max-h-24 opacity-100" : "max-h-0 opacity-0"}`}
              >
                {s.body}
              </span>
            </span>
            <span
              className={`absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-mono text-[11px] text-white ring-1 ring-white/20 backdrop-blur transition ${active ? "bg-sky-500 ring-sky-300" : ""}`}
            >
              0{i + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Full-bleed photo band that drifts slower than the page as you scroll. */
export function ParallaxBand({ src, children, className = "" }: { src: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-12%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduced ? [1, 1, 1] : [1.15, 1.08, 1.15]);
  return (
    <section ref={ref} className={`relative isolate overflow-hidden ${className}`}>
      <motion.div className="absolute inset-[-12%_0] -z-10" style={{ y, scale }}>
        <AzurePhoto src={src} alt="" sizes="100vw" className="absolute inset-0" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--color-navy-950)_0%,rgb(5_8_15/0.55)_30%,rgb(5_8_15/0.55)_70%,var(--color-navy-950)_100%)]" />
      {children}
    </section>
  );
}

/** Card that tilts toward the cursor. */
export function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  return (
    <div
      ref={ref}
      className={`transition-transform duration-300 ease-out [transform-style:preserve-3d] ${className}`}
      onPointerMove={(e) => {
        if (reduced || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        ref.current.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      }}
      onPointerLeave={() => ref.current && (ref.current.style.transform = "")}
    >
      {children}
    </div>
  );
}
