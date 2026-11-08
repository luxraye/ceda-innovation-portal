// Runs the Genspark Hono API inside the browser, on an in-memory SQLite (sql.js) database
// shaped like Cloudflare D1. Changes are kept in this browser's localStorage.
import initSqlJs from "sql.js";
import app from "../../builds/genspark/genspark/src/index";
import schema from "../../builds/genspark/genspark/migrations/0001_initial_schema.sql";
import seed from "../../builds/genspark/genspark/seed.sql";

declare const __BP__: string;
const KEY = "ceda_genspark_preview_db_v1";

function toParams(a: any[]) { return a.map((v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v)); }

function makeD1(db: any, onWrite: () => void) {
  const exec = (sql: string, params: any[]) => {
    const st = db.prepare(sql);
    st.bind(toParams(params));
    const rows: any[] = [];
    while (st.step()) rows.push(st.getAsObject());
    st.free();
    return rows;
  };
  class Stmt {
    constructor(public sql: string, public params: any[] = []) {}
    bind(...p: any[]) { return new Stmt(this.sql, p); }
    async first(col?: string) { const r = exec(this.sql, this.params)[0] ?? null; return col && r ? r[col] : r; }
    async all() { const results = exec(this.sql, this.params); return { results, success: true, meta: {} }; }
    async raw() { return exec(this.sql, this.params).map((r) => Object.values(r)); }
    async run() {
      const results = exec(this.sql, this.params);
      const last = db.exec("SELECT last_insert_rowid() AS id, changes() AS c")[0].values[0];
      onWrite();
      return { results, success: true, meta: { last_row_id: last[0], changes: last[1] } };
    }
  }
  return {
    prepare: (sql: string) => new Stmt(sql),
    batch: async (stmts: Stmt[]) => { const out = []; for (const s of stmts) out.push(await s.run()); return out; },
    exec: async (sql: string) => { db.exec(sql); onWrite(); return { count: 1, duration: 0 }; },
  };
}

const ready = (async () => {
  const SQL = await initSqlJs({ locateFile: () => __BP__ + "/static/sql-wasm.wasm" });
  let db: any;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) db = new SQL.Database(Uint8Array.from(atob(saved), (c) => c.charCodeAt(0)));
  } catch {}
  if (!db) { db = new SQL.Database(); db.exec(schema); db.exec(seed); }
  let t: any;
  const persist = () => {
    clearTimeout(t);
    t = setTimeout(() => {
      try {
        const bytes = db.export(); let s = "";
        for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000) as any);
        localStorage.setItem(KEY, btoa(s));
      } catch {}
    }, 300);
  };
  return makeD1(db, persist);
})();

const realFetch = window.fetch.bind(window);
window.fetch = async (input: any, init?: any) => {
  const url = new URL(typeof input === "string" ? input : input.url, location.href);
  let p = url.pathname;
  if (p.startsWith(__BP__ + "/")) p = p.slice(__BP__.length);
  if (url.origin === location.origin && p.startsWith("/api/")) {
    const DB = await ready;
    const req = new Request("http://preview.local" + p + url.search, {
      method: init?.method || "GET",
      headers: init?.headers,
      body: init?.body,
    });
    return app.fetch(req, { DB } as any, { waitUntil() {}, passThroughOnException() {} } as any);
  }
  return realFetch(input, init);
};
(window as any).__resetPreviewDb = () => { localStorage.removeItem(KEY); location.reload(); };
