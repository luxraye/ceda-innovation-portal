"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

type Item = { id: string; title: string; body: string; href: string | null; kind: string; readAt: string | null; createdAt: string; channels: string };

const DOT: Record<string, string> = { SUCCESS: "bg-emerald-500", ACTION: "bg-gold-500", WARNING: "bg-rose-500", INFO: "bg-sky-500" };

function ago(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}

/** Live notification centre. Polls every 10 seconds so stage changes appear without a refresh. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ items: Item[]; unread: number }>({ items: [], unread: 0 });
  const [pulse, setPulse] = useState(false);
  const lastUnread = useRef(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (!res.ok) return;
    const json = await res.json();
    if (json.unread > lastUnread.current) {
      setPulse(true);
      setTimeout(() => setPulse(false), 2500);
    }
    lastUnread.current = json.unread;
    setData(json);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 10_000);
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => {
      clearInterval(t);
      document.removeEventListener("click", onDoc);
    };
  }, [load]);

  async function markRead() {
    await fetch("/api/notifications", { method: "POST" });
    lastUnread.current = 0;
    load();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:text-sky-700"
        aria-label={`Notifications, ${data.unread} unread`}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {data.unread > 0 && (
          <span className={`absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[11px] font-bold text-navy-950 ${pulse ? "animate-pulse-ring" : ""}`}>
            {data.unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-navy-900">Notifications</div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
              </div>
            </div>
            {data.unread > 0 && (
              <button onClick={markRead} className="text-xs font-medium text-sky-700 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
            {data.items.length === 0 && <li className="px-4 py-8 text-center text-sm text-slate-500">You're all caught up.</li>}
            {data.items.map((n) => (
              <li key={n.id} className={n.readAt ? "" : "bg-sky-50/60"}>
                <Link href={n.href ?? "#"} onClick={() => setOpen(false)} className="flex gap-3 px-4 py-3 hover:bg-slate-50">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[n.kind] ?? DOT.INFO}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-navy-900">{n.title}</span>
                    <span className="block text-xs text-slate-600">{n.body}</span>
                    <span className="mt-1 block text-[11px] text-slate-400">
                      {ago(n.createdAt)} · {n.channels.split(",").map((c) => c.replace("_", "-").toLowerCase()).join(", ")}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
