import { encode } from "@auth/core/jwt";
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const out = {};
for (const email of ["innovator@demo.ceda.bw","evaluator@demo.ceda.bw","panel@demo.ceda.bw","admin@demo.ceda.bw","super@demo.ceda.bw"]) {
  const u = await p.user.findUnique({ where: { email } });
  out[email] = await encode({ token: { sub: u.id, name: u.name, email: u.email, role: u.role, organizationName: u.organizationName }, secret: "preview-secret-preview-secret-preview-1234", salt: "authjs.session-token", maxAge: 86400 });
}
console.log(JSON.stringify(out));
await p.$disconnect();
