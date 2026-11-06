// Seeded demo accounts for judges. All share DEMO_PASSWORD.
export const DEMO_PASSWORD = "SkyDemo2026!";

export const DEMO_ACCOUNTS = [
  { email: "naledi@demo.sky.bw", name: "Naledi Sebego", role: "INNOVATOR", note: "Founder, Pula Sense (Pty) Ltd. Has ideas at several stages, including one with feedback to answer." },
  { email: "thabo.eval@demo.sky.bw", name: "Dr Thabo Kgosi", role: "EVALUATOR", note: "Agri-tech and engineering evaluator with ideas waiting to be scored." },
  { email: "lesego.adj@demo.sky.bw", name: "Lesego Molefe", role: "ADJUDICATOR", note: "CEDA innovation committee member deciding the shortlist." },
  { email: "admin@demo.sky.bw", name: "Kagiso Dintwe", role: "ADMIN", note: "CEDA programme manager who runs calls, panels and reports." },
  { email: "dpo@demo.sky.bw", name: "Boitumelo Ramotswa", role: "DPO", note: "Data Protection Officer handling consent, rights requests and breaches." },
] as const;
