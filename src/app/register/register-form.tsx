"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { register } from "@/app/actions/auth";

type Consent = { key: string; label: string; detail: string; required: boolean };

function age(dob: string) {
  if (!dob) return null;
  const d = new Date(dob);
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) a--;
  return a;
}

export function RegisterForm({ districts, sectors, consents, consentVersion }: { districts: string[]; sectors: string[]; consents: Consent[]; consentVersion: string }) {
  const [state, action, pending] = useActionState(register, undefined);
  const [dob, setDob] = useState("");
  const [uin, setUin] = useState("");
  const [youth, setYouth] = useState("");
  const [citizen, setCitizen] = useState(false);
  const fe = state?.fieldErrors ?? {};

  const checks = useMemo(() => {
    const a = age(dob);
    return [
      { label: "Aged 18 to 35", ok: a !== null && a >= 18 && a <= 35, pending: !dob, detail: a !== null ? `You are ${a}` : "Enter your date of birth" },
      { label: "Motswana citizen", ok: citizen, pending: !citizen, detail: citizen ? "Confirmed" : "Tick the citizenship box" },
      { label: "CIPA UIN (BW + 11 digits)", ok: /^BW\d{11}$/i.test(uin.trim()), pending: !uin, detail: uin || "e.g. BW00009995803" },
      { label: "More than 50% youth-owned", ok: Number(youth) > 50, pending: !youth, detail: youth ? `${youth}% youth shareholding` : "Enter the percentage" },
    ];
  }, [dob, uin, youth, citizen]);
  const eligible = checks.every((c) => c.ok);

  const err = (k: string) => fe[k] && <p className="mt-1 text-xs text-rose-600">{fe[k]}</p>;

  return (
    <form action={action} className="mt-8 space-y-10">
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-navy-900">1. About you</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input id="name" name="name" className="input" required autoComplete="name" />
            {err("name")}
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="input" required autoComplete="email" />
            {err("email")}
          </div>
          <div>
            <label className="label" htmlFor="phone">Mobile number</label>
            <input id="phone" name="phone" className="input" placeholder="71234567" required autoComplete="tel" />
            <p className="help">For SMS updates on your application.</p>
            {err("phone")}
          </div>
          <div>
            <label className="label" htmlFor="dateOfBirth">Date of birth</label>
            <input id="dateOfBirth" name="dateOfBirth" type="date" className="input" required value={dob} onChange={(e) => setDob(e.target.value)} />
            {err("dateOfBirth")}
          </div>
          <div>
            <label className="label" htmlFor="gender">Gender</label>
            <select id="gender" name="gender" className="input" required defaultValue="">
              <option value="" disabled>Choose</option>
              <option>Female</option>
              <option>Male</option>
              <option>Prefer not to say</option>
            </select>
            <p className="help">Used only for anonymous participation reports.</p>
          </div>
          <div>
            <label className="label" htmlFor="district">District</label>
            <select id="district" name="district" className="input" required defaultValue="">
              <option value="" disabled>Choose</option>
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
            {err("district")}
          </div>
        </div>
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" name="citizen" className="mt-0.5 h-4 w-4 accent-sky-600" checked={citizen} onChange={(e) => setCitizen(e.target.checked)} />
          I am a citizen of Botswana.
        </label>
        {err("citizen")}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-navy-900">2. Your company</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="orgName">Registered company name</label>
            <input id="orgName" name="orgName" className="input" required placeholder="e.g. Local Grow (Pty) Ltd" />
            {err("orgName")}
          </div>
          <div>
            <label className="label" htmlFor="uin">CIPA UIN</label>
            <input id="uin" name="uin" className="input font-mono uppercase" required value={uin} onChange={(e) => setUin(e.target.value)} placeholder="BW00000000000" />
            <p className="help">Shown on your certificate of incorporation.</p>
          </div>
          <div>
            <label className="label" htmlFor="youthShareholdingPct">Youth shareholding (%)</label>
            <input id="youthShareholdingPct" name="youthShareholdingPct" type="number" min={0} max={100} className="input" required value={youth} onChange={(e) => setYouth(e.target.value)} />
            <p className="help">Shares held by citizens aged 18 to 35.</p>
          </div>
          <div>
            <label className="label" htmlFor="employees">Employees</label>
            <input id="employees" name="employees" type="number" min={1} defaultValue={1} className="input" required />
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor="sector">Sector</label>
            <select id="sector" name="sector" className="input" required defaultValue="">
              <option value="" disabled>Choose</option>
              {sectors.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className={`rounded-2xl border p-4 ${eligible ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`} aria-live="polite">
          <div className="text-sm font-semibold text-navy-900">{eligible ? "You're eligible for CEDA innovation calls" : "Eligibility check"}</div>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-2 text-sm">
                {c.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> : <CircleAlert className={`mt-0.5 h-4 w-4 ${c.pending ? "text-slate-400" : "text-rose-500"}`} />}
                <span>
                  <span className="font-medium text-slate-800">{c.label}</span>
                  <span className="block text-xs text-slate-500">{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-navy-900">3. Password</legend>
        <div className="max-w-sm">
          <label className="label" htmlFor="password">Choose a password</label>
          <input id="password" name="password" type="password" className="input" required minLength={10} autoComplete="new-password" />
          <p className="help">At least 10 characters, with a capital letter and a number.</p>
          {err("password")}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-lg font-semibold text-navy-900">4. Your consent</legend>
        <p className="text-sm text-slate-600">
          Under the Data Protection Act 2024 you decide how CEDA uses your information. The first two are needed to apply; the others
          are optional and you can change them later in your privacy centre. Consent version {consentVersion}.
        </p>
        {consents.map((c) => (
          <label key={c.key} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 text-sm">
            <input type="checkbox" name={`consent_${c.key}`} className="mt-0.5 h-4 w-4 accent-sky-600" required={c.required} />
            <span>
              <span className="font-medium text-navy-900">{c.label}</span>
              {c.required ? <span className="ml-2 chip bg-sky-100 text-sky-800">Required</span> : <span className="ml-2 chip bg-slate-100 text-slate-600">Optional</span>}
              <span className="mt-0.5 block text-slate-600">{c.detail}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {state?.error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{state.error}</p>}
      <button className="btn-primary w-full py-3 text-base" disabled={pending}>
        {pending ? "Creating your account..." : "Create account"}
      </button>
    </form>
  );
}
