// Hosted builds (e.g. Vercel) with a PostgreSQL DATABASE_URL: create the tables
// and load the demo data the first time, so a fresh deploy is usable at once.
// Later builds keep existing data. Does nothing for local SQLite.
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const url = process.env.DATABASE_URL ?? "";
if (!/^postgres(ql)?:\/\//.test(url)) process.exit(0);

execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
const prisma = new PrismaClient();
const users = await prisma.user.count();
await prisma.$disconnect();
if (users === 0) {
  console.log("[arena] Empty database: loading demo data");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
} else {
  console.log(`[arena] Database already has ${users} users: keeping it`);
}
