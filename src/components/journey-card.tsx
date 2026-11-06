"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Bell, ClipboardCheck, Gavel, Send, Trophy } from "lucide-react";

// A looping illustration of one idea moving through Sky, so a first-time
// visitor understands the product in five seconds.
const EVENTS = [
  { icon: Send, title: "Idea submitted", body: "Receipt SKY-26-0042 sealed with SHA-256", stage: 0 },
  { icon: BadgeCheck, title: "Eligibility confirmed", body: "UIN verified · 80% youth-owned", stage: 1 },
  { icon: ClipboardCheck, title: "Panel scored your idea", body: "3 evaluators · blind review · 78/100", stage: 2 },
  { icon: Bell, title: "Feedback from the panel", body: "\"Show pilot data from two farms\"", stage: 2 },
  { icon: Gavel, title: "Committee decision", body: "Advanced to award with reasons recorded", stage: 3 },
  { icon: Trophy, title: "Awarded P150,000", body: "CEDA Youth Innovation Challenge 2026", stage: 4 },
];
const STAGES = ["Submit", "Screen", "Panel", "Committee", "Award"];

export function JourneyCard() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % EVENTS.length), 2200);
    return () => clearInterval(t);
  }, []);
  const stage = EVENTS[i].stage;
  return (
    <div className="relative animate-rise [animation-delay:150ms]" aria-label="Example: one idea's journey through Sky">
      <div className="absolute -top-6 -right-6 h-40 w-40 rounded-full bg-gold-400/30 blur-3xl" aria-hidden="true" />
      <div className="card relative overflow-hidden p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-wide text-sky-700 uppercase">Agri-tech · Kgalagadi</div>
            <div className="font-display mt-1 text-xl font-bold text-navy-900">Pula Sense</div>
            <div className="text-sm text-slate-500">Solar soil sensors that text farmers when to water</div>
          </div>
          <span className="chip bg-emerald-100 text-emerald-800">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
          </span>
        </div>
        <div className="mt-6 flex items-center">
          {STAGES.map((s, idx) => (
            <div key={s} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <span className={`h-0.5 flex-1 ${idx === 0 ? "opacity-0" : idx <= stage ? "bg-sky-500" : "bg-slate-200"} transition-colors duration-500`} />
                <span
                  className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-500 ${
                    idx < stage ? "border-sky-600 bg-sky-600" : idx === stage ? "scale-125 border-sky-600 bg-white animate-pulse-ring" : "border-slate-300 bg-white"
                  }`}
                />
                <span className={`h-0.5 flex-1 ${idx === STAGES.length - 1 ? "opacity-0" : idx < stage ? "bg-sky-500" : "bg-slate-200"} transition-colors duration-500`} />
              </div>
              <span className={`mt-2 text-[11px] font-medium ${idx === stage ? "text-navy-900" : "text-slate-400"}`}>{s}</span>
            </div>
          ))}
        </div>
        <ul className="mt-6 space-y-2.5" aria-live="polite">
          {EVENTS.slice(0, i + 1)
            .slice(-4)
            .reverse()
            .map((e, idx) => (
              <li
                key={e.title}
                className={`flex items-start gap-3 rounded-xl border p-3 transition-all duration-500 ${idx === 0 ? "border-sky-200 bg-sky-50" : "border-slate-100 bg-white opacity-70"}`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${idx === 0 ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                  <e.icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-navy-900">{e.title}</span>
                  <span className="block text-xs text-slate-500">{e.body}</span>
                </span>
              </li>
            ))}
        </ul>
        <div className="mt-4 text-center text-[11px] text-slate-400">Illustration · every step sends the innovator a notification</div>
      </div>
    </div>
  );
}
