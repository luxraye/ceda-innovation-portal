// Seeded demo accounts for judges. All share DEMO_PASSWORD.
export const DEMO_PASSWORD = "CedaDemo2026!";

export const DEMO_ACCOUNTS = [
  { email: "naledi@demo.ceda.bw", name: "Naledi Sebego", role: "INNOVATOR", note: "Founder, Pula Sense (Pty) Ltd. Has ideas at several stages, including one with feedback to answer." },
  { email: "thabo.eval@demo.ceda.bw", name: "Dr Thabo Kgosi", role: "EVALUATOR", note: "Agri-tech and engineering evaluator with ideas waiting to be scored." },
  { email: "lesego.adj@demo.ceda.bw", name: "Lesego Molefe", role: "ADJUDICATOR", note: "CEDA innovation committee member deciding the shortlist." },
  { email: "admin@demo.ceda.bw", name: "Kagiso Dintwe", role: "ADMIN", note: "CEDA programme manager who runs calls, panels and reports." },
  { email: "dpo@demo.ceda.bw", name: "Boitumelo Ramotswa", role: "DPO", note: "Data Protection Officer handling consent, rights requests and breaches." },
] as const;
