"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, Bell, ClipboardCheck, Gavel, Send, Trophy } from "lucide-react";

// A looping illustration of one idea moving through Sky, so a first-time
// visitor understands the product in five seconds.
const EVENTS = [
  { icon: Send, title: "Idea submitted", body: "Receipt SKY-26-0042 sealed with SHA-256", stage: 0, t: "09:12" },
  { icon: BadgeCheck, title: "Eligibility confirmed", body: "UIN verified · 80% youth-owned", stage: 1, t: "Day 2" },
  { icon: ClipboardCheck, title: "Panel scored your idea", body: "3 evaluators · blind review · 78/100", stage: 2, t: "Day 9" },
  { icon: Bell, title: "Feedback from the panel", body: "“Show pilot data from two farms”", stage: 2, t: "Day 9" },
  { icon: Gavel, title: "Committee decision", body: "Advanced to award, reasons recorded", stage: 3, t: "Day 16" },
  { icon: Trophy, title: "Awarded P150,000", body: "CEDA Youth Innovation Challenge 2026", stage: 4, t: "Day 21" },
];
const STAGES = ["Submit", "Screen", "Panel", "Committee", "Award"];

export function JourneyCard() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % EVENTS.length), 2400);
    return () => clearInterval(t);
  }, []);
  const stage = EVENTS[i].stage;
  const pct = (stage / (STAGES.length - 1)) * 100;
  return (
    <div className="card-dark relative overflow-hidden p-6" aria-label="Example: one idea's journey through Sky">
      <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" aria-hidden="true" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow text-sky-300/80">Agri-tech · Kgalagadi</div>
          <div className="mt-2 text-xl font-semibold tracking-tight text-white">Pula Sense</div>
          <div className="text-sm text-white/50">Solar soil sensors that text farmers when to water</div>
        </div>
        <span className="chip bg-emerald-400/10 text-emerald-300 ring-emerald-400/25">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live
        </span>
      </div>

      <div className="relative mt-7">
        <div className="absolute top-[7px] right-[10%] left-[10%] h-px bg-white/10" />
        <motion.div
          className="absolute top-[7px] left-[10%] h-px bg-gradient-to-r from-sky-400 to-sky-200 shadow-[0_0_12px_rgb(94_163_255)]"
          animate={{ width: `${pct * 0.8}%` }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
        />
        <div className="relative grid grid-cols-5">
          {STAGES.map((s, idx) => (
            <div key={s} className="flex flex-col items-center">
              <span
                className={`h-3.5 w-3.5 rounded-full transition-all duration-500 ${
                  idx < stage
                    ? "bg-sky-400"
                    : idx === stage
                      ? "animate-pulse-ring bg-white ring-4 ring-sky-400/40"
                      : "bg-navy-900 ring-1 ring-white/20"
                }`}
              />
              <span className={`mt-2.5 text-[11px] transition-colors ${idx === stage ? "text-white" : "text-white/35"}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <ul className="relative mt-7 h-[212px] space-y-2" aria-live="polite">
        <AnimatePresence initial={false}>
          {EVENTS.slice(0, i + 1)
            .slice(-3)
            .reverse()
            .map((e, idx) => (
              <motion.li
                key={e.title}
                layout
                initial={{ opacity: 0, y: -14, scale: 0.98 }}
                animate={{ opacity: idx === 0 ? 1 : 0.45 - idx * 0.1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
                className={`flex items-start gap-3 rounded-xl p-3 ${idx === 0 ? "bg-white/[0.06] ring-1 ring-sky-300/25" : "ring-1 ring-white/[0.06]"}`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${idx === 0 ? "bg-sky-500 text-white shadow-[0_0_20px_-2px_rgb(46_134_255)]" : "bg-white/5 text-white/50"}`}
                >
                  <e.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white">{e.title}</span>
                    <span className="font-mono text-[10.5px] text-white/35">{e.t}</span>
                  </span>
                  <span className="block truncate text-xs text-white/50">{e.body}</span>
                </span>
              </motion.li>
            ))}
        </AnimatePresence>
      </ul>
      <div className="mt-2 text-center font-mono text-[10.5px] tracking-wide text-white/30">Illustration · every step notifies the innovator</div>
    </div>
  );
}
