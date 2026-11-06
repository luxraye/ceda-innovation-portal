// Picks the Prisma provider from DATABASE_URL so one schema serves
// SQLite on a laptop and PostgreSQL in production.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

if (existsSync(".env") && !process.env.DATABASE_URL) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*DATABASE_URL\s*=\s*"?([^"]*)"?\s*$/);
    if (m) process.env.DATABASE_URL = m[1];
  }
}
const url = process.env.DATABASE_URL ?? "";
const provider = /^postgres(ql)?:\/\//.test(url) ? "postgresql" : "sqlite";
const path = "prisma/schema.prisma";
const schema = readFileSync(path, "utf8");
const next = schema.replace(/(datasource db \{\s*provider\s*=\s*)"[^"]+"/, `$1"${provider}"`);
if (next !== schema) writeFileSync(path, next);
console.log(`[sky] Prisma provider: ${provider}`);
