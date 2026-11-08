// Seeded demo accounts for judges. All share DEMO_PASSWORD.
export const DEMO_PASSWORD = "SkyDemo2026!";

export type DemoStep = { label: string; href: string };

export const DEMO_ACCOUNTS = [
  {
    email: "naledi@demo.sky.bw",
    name: "Naledi Sebego",
    role: "INNOVATOR",
    side: "Applicant",
    who: "A young founder applying for CEDA funding",
    note: "Founder, Pula Sense (Pty) Ltd. Has ideas at several stages, including one with feedback to answer.",
    try: [
      { label: "Track an idea and answer feedback", href: "/app/innovator" },
      { label: "Solve a challenge on the Range", href: "/app/innovator/range" },
      { label: "See how the Index is scored", href: "/app/innovator/profile" },
    ],
  },
  {
    email: "thabo.eval@demo.sky.bw",
    name: "Dr Thabo Kgosi",
    role: "EVALUATOR",
    side: "CEDA",
    who: "A panel member who scores ideas blind",
    note: "Agri-tech and engineering evaluator with ideas waiting to be scored.",
    try: [
      { label: "Open the review queue and score an idea", href: "/app/evaluator" },
    ],
  },
  {
    email: "lesego.adj@demo.sky.bw",
    name: "Lesego Molefe",
    role: "ADJUDICATOR",
    side: "CEDA",
    who: "A committee member who makes the final decision",
    note: "CEDA innovation committee member deciding the shortlist.",
    try: [
      { label: "Advance, decline or award from the ranked shortlist", href: "/app/adjudicator" },
      { label: "Browse verified companies", href: "/app/talent" },
      { label: "Read the programme reports", href: "/app/reports" },
    ],
  },
  {
    email: "admin@demo.sky.bw",
    name: "Kagiso Dintwe",
    role: "ADMIN",
    side: "CEDA",
    who: "The CEDA programme manager who runs everything",
    note: "CEDA programme manager who runs calls, panels and reports.",
    try: [
      { label: "Watch every idea on the pipeline board", href: "/app/admin/pipeline" },
      { label: "Build a call and its rubric without code", href: "/app/admin/calls" },
      { label: "Verify the tamper-evident audit chain", href: "/app/admin/audit" },
    ],
  },
  {
    email: "dpo@demo.sky.bw",
    name: "Boitumelo Ramotswa",
    role: "DPO",
    side: "CEDA",
    who: "The officer responsible for personal data and the law",
    note: "Data Protection Officer handling consent, rights requests and breaches.",
    try: [
      { label: "Handle consent, rights requests and breaches", href: "/app/dpo" },
      { label: "Check who did what in the audit trail", href: "/app/admin/audit" },
    ],
  },
] as const satisfies readonly {
  email: string;
  name: string;
  role: string;
  side: "Applicant" | "CEDA";
  who: string;
  note: string;
  try: readonly DemoStep[];
}[];

export const isDemo = () => process.env.DEMO_MODE === "true";
