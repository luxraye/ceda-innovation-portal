import type { FormField } from "./domain";
import { SECTORS } from "./domain";

/** Default application form CEDA staff start from when building a call. */
export const DEFAULT_FORM: FormField[] = [
  { key: "title", label: "Name of your idea", type: "text", required: true, maxLength: 80, section: "Your idea", help: "Short and memorable, e.g. \"Pula Sense\"." },
  { key: "summary", label: "Your idea in two sentences", type: "textarea", required: true, maxLength: 300, section: "Your idea", help: "What it is and who it helps." },
  { key: "sector", label: "Sector", type: "select", required: true, options: [...SECTORS], section: "Your idea" },
  { key: "problem", label: "What problem are you solving, and for whom?", type: "textarea", required: true, maxLength: 1500, section: "Problem and solution" },
  { key: "solution", label: "How does your solution work?", type: "textarea", required: true, maxLength: 2000, section: "Problem and solution" },
  { key: "innovation", label: "What is new about it compared with what exists in Botswana today?", type: "textarea", required: true, maxLength: 1200, section: "Problem and solution" },
  { key: "market", label: "Who will pay, and how many customers could you reach in 3 years?", type: "textarea", required: true, maxLength: 1500, section: "Market and impact" },
  { key: "jobs", label: "Jobs you expect to create in 3 years", type: "number", required: true, min: 0, max: 10000, section: "Market and impact" },
  { key: "impact", label: "How does it support Botswana's development goals?", type: "textarea", required: true, maxLength: 1200, section: "Market and impact", help: "For example economic diversification, jobs for youth, food security or digital inclusion." },
  { key: "stage", label: "How far along are you?", type: "select", required: true, options: ["Idea only", "Prototype built", "Piloting with users", "Earning revenue"], section: "Readiness" },
  { key: "funding", label: "Funding requested (BWP)", type: "number", required: true, min: 0, max: 5000000, section: "Readiness" },
  { key: "useOfFunds", label: "How would you use the funding?", type: "textarea", required: true, maxLength: 1200, section: "Readiness" },
  { key: "team", label: "Who is on your team and what do they bring?", type: "textarea", required: true, maxLength: 1200, section: "Your team" },
  { key: "demoUrl", label: "Link to a demo or video", type: "url", required: false, section: "Your team" },
  { key: "pitchDeck", label: "Pitch deck", type: "file", required: true, section: "Documents", accept: ".pdf,.pptx" },
  { key: "cipaCert", label: "CIPA certificate of incorporation", type: "file", required: true, section: "Documents", accept: ".pdf,.png,.jpg,.jpeg" },
  { key: "financials", label: "Budget or financial projections", type: "file", required: false, section: "Documents", accept: ".pdf,.xlsx" },
];

export const DEFAULT_CRITERIA = [
  { name: "Innovation and originality", description: "How new the idea is for Botswana, and how hard it would be to copy.", weight: 25 },
  { name: "Market potential", description: "Size of the opportunity, willingness to pay and a credible route to customers.", weight: 20 },
  { name: "Feasibility and readiness", description: "Can this team build and run it with the funding asked for?", weight: 20 },
  { name: "Socio-economic impact", description: "Jobs for youth, inclusion and contribution to national development priorities.", weight: 20 },
  { name: "Team capability", description: "Skills, commitment and track record of the founders.", weight: 15 },
];

export const DEFAULT_STAGES = [
  { name: "Eligibility screening", kind: "SCREENING", description: "CEDA confirms the company, youth shareholding and documents. Usually within 5 working days.", minReviewers: 1, blind: false },
  { name: "Panel evaluation", kind: "PANEL", description: "At least two independent evaluators score the idea blind against the published criteria.", minReviewers: 2, blind: true },
  { name: "Committee adjudication", kind: "ADJUDICATION", description: "The CEDA innovation committee reviews ranked ideas, may invite a pitch, and decides.", minReviewers: 1, blind: false },
  { name: "Award", kind: "AWARD", description: "Winners receive funding and enter CEDA's mentoring and aftercare programme.", minReviewers: 0, blind: false },
];
