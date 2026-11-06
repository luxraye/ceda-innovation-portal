// CEDA hackathon eligibility: Botswana citizen youth (18-35) in a company
// with more than 50% youth shareholding, registered with CIPA.

export const UIN_PATTERN = /^BW\d{11}$/;

export function ageOn(dob: Date, on = new Date()) {
  let age = on.getFullYear() - dob.getFullYear();
  const m = on.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < dob.getDate())) age--;
  return age;
}

export type EligibilityInput = {
  dateOfBirth: Date;
  citizen: boolean;
  uin: string;
  youthShareholdingPct: number;
};

export function checkEligibility(i: EligibilityInput) {
  const age = ageOn(i.dateOfBirth);
  const checks = [
    { key: "age", label: "Applicant is 18 to 35 years old", ok: age >= 18 && age <= 35, detail: `Age ${age}` },
    { key: "citizen", label: "Applicant is a Motswana citizen", ok: i.citizen, detail: i.citizen ? "Confirmed" : "Not confirmed" },
    {
      key: "uin",
      label: "Company has a valid CIPA UIN",
      ok: UIN_PATTERN.test(i.uin.trim().toUpperCase()),
      detail: i.uin || "Missing",
    },
    {
      key: "youth",
      label: "Youth shareholding is more than 50%",
      ok: i.youthShareholdingPct > 50,
      detail: `${i.youthShareholdingPct}% youth-owned`,
    },
  ];
  return { eligible: checks.every((c) => c.ok), checks };
}
