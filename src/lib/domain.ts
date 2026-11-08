// Allowed values for string-backed fields, plus labels the UI shows.

export const ROLES = ["INNOVATOR", "EVALUATOR", "ADJUDICATOR", "ADMIN", "DPO"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_INFO: Record<Role, { label: string; blurb: string; home: string }> = {
  INNOVATOR: {
    label: "Innovator",
    blurb: "Youth-owned company submitting ideas to CEDA calls",
    home: "/app/innovator",
  },
  EVALUATOR: {
    label: "Evaluator",
    blurb: "Panel member who scores ideas against the call rubric",
    home: "/app/evaluator",
  },
  ADJUDICATOR: {
    label: "Adjudicator",
    blurb: "CEDA innovation committee member who makes final decisions",
    home: "/app/adjudicator",
  },
  ADMIN: {
    label: "Programme admin",
    blurb: "Runs calls, stages, panels and reporting",
    home: "/app/admin",
  },
  DPO: {
    label: "Data Protection Officer",
    blurb: "Oversees consent, data rights, retention and breaches",
    home: "/app/dpo",
  },
};

export const SUBMISSION_STATUS = {
  DRAFT: { label: "Draft", tone: "slate" },
  SUBMITTED: { label: "Submitted", tone: "sky" },
  IN_REVIEW: { label: "In review", tone: "indigo" },
  CHANGES_REQUESTED: { label: "Changes requested", tone: "amber" },
  ADVANCED: { label: "Advanced", tone: "emerald" },
  DECLINED: { label: "Not selected", tone: "rose" },
  AWARDED: { label: "Awarded", tone: "gold" },
  WITHDRAWN: { label: "Withdrawn", tone: "slate" },
} as const;
export type SubmissionStatus = keyof typeof SUBMISSION_STATUS;

export const STAGE_KINDS = {
  SCREENING: "Eligibility screening",
  PANEL: "Panel evaluation",
  ADJUDICATION: "Committee adjudication",
  AWARD: "Award",
} as const;

export const DATA_REQUEST_TYPES = {
  ACCESS: "See a copy of my data",
  RECTIFICATION: "Correct my data",
  ERASURE: "Erase my data",
  RESTRICTION: "Restrict processing",
  OBJECTION: "Object to processing",
  PORTABILITY: "Move my data elsewhere",
} as const;
export type DataRequestType = keyof typeof DATA_REQUEST_TYPES;

export const CONSENT_PURPOSES = {
  PROCESSING: {
    label: "Process my application",
    detail:
      "CEDA may use the details I give to check eligibility and manage my application. Required to apply.",
    required: true,
  },
  EVALUATION_SHARING: {
    label: "Share my idea with the evaluation panel",
    detail:
      "Named evaluators and the CEDA innovation committee may read my submission under confidentiality. Required to apply.",
    required: true,
  },
  SHOWCASE: {
    label: "Feature my idea if it wins",
    detail: "CEDA may publish my company name, idea title and summary in its innovation showcase.",
    required: false,
  },
  MARKETING: {
    label: "Tell me about future CEDA programmes",
    detail: "Occasional emails or SMS about funding, training and new calls. Withdraw any time.",
    required: false,
  },
} as const;
export type ConsentPurpose = keyof typeof CONSENT_PURPOSES;
export const CONSENT_VERSION = "2026.11-v1";

export const DISTRICTS = [
  "Gaborone",
  "Francistown",
  "South East",
  "Kweneng",
  "Kgatleng",
  "Southern",
  "Central",
  "North East",
  "North West",
  "Chobe",
  "Ghanzi",
  "Kgalagadi",
  "Lobatse",
  "Selebi-Phikwe",
  "Jwaneng",
  "Sowa Town",
] as const;

export const SECTORS = [
  "Agriculture & Agro-processing",
  "Digital & ICT",
  "Manufacturing",
  "Tourism & Creative",
  "Energy & Environment",
  "Health",
  "Financial Services",
  "Mining Services",
  "Education",
  "Logistics",
] as const;

/** Rows of the call matrix: a call can target one sector or be open to all. */
export const CALL_SECTORS = ["Cross-sector", ...SECTORS] as const;

/** Columns of the call matrix: how far along the ventures a call is meant for are. */
export const VENTURE_STAGES = ["Idea", "Prototype", "Pilot", "Early revenue", "Growth"] as const;
export const VENTURE_STAGE_HINT: Record<(typeof VENTURE_STAGES)[number], string> = {
  Idea: "Grant to test an idea",
  Prototype: "Build a first version",
  Pilot: "Prove it with real users",
  "Early revenue": "Loan or grant to start selling",
  Growth: "Finance to scale up",
};

// Form builder field definition stored as JSON on each call.
export type FieldType = "text" | "textarea" | "select" | "number" | "url" | "file";
export type FormField = {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  help?: string;
  options?: string[];
  maxLength?: number;
  min?: number;
  max?: number;
  section: string;
  accept?: string;
};

// Requirement tags for "judge mode": where each 3.2 function lives in the product.
export const REQUIREMENTS = {
  a: "3.2(a) Submission interface",
  b: "3.2(b) Multi-level evaluation",
  c: "3.2(c) Real-time tracking",
  d: "3.2(d) Access control & security",
  e: "3.2(e) Feedback & iteration",
  f: "3.2(f) Reporting",
  g: "3.2(g) Scalability",
  dpa: "Data Protection Act 2024",
} as const;
export type RequirementKey = keyof typeof REQUIREMENTS;
