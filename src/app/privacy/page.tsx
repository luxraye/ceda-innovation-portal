import { PublicFooter, PublicHero } from "@/components/public-chrome";
import { CONSENT_PURPOSES, CONSENT_VERSION } from "@/lib/domain";

export const metadata = { title: "Privacy notice" };

export default function PrivacyNotice() {
  return (
    <div className="bg-slate-50">
      <PublicHero
        narrow
        eyebrow="Data Protection Act 2024"
        title={<>Privacy <span className="font-serif text-[1.08em] text-sky-300 italic">notice.</span></>}
        body={`Version ${CONSENT_VERSION} · Prototype text for the CEDA hackathon, to be confirmed by CEDA's Data Protection Officer.`}
      />
      <article className="mx-auto max-w-5xl px-4 py-14 md:px-8">
        <div className="card max-w-3xl space-y-8 p-8 text-[15px] leading-relaxed text-slate-700 md:p-10">
          <section>
            <h2 className="text-xl font-semibold text-navy-900">Who is responsible</h2>
            <p className="mt-2">The Citizen Entrepreneurial Development Agency (CEDA) is the data controller for Arena. CEDA's Data Protection Officer can be reached through the privacy centre in your account. You may also complain to the Information and Data Protection Commission.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-navy-900">What we collect and why</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Your name, contact details, date of birth and district, to confirm eligibility and contact you about your application.</li>
              <li>Your company's name, CIPA UIN, youth shareholding and sector, to confirm the company qualifies.</li>
              <li>Your ideas and documents, so CEDA's evaluators and committee can assess them.</li>
              <li>Gender, used only in anonymous totals so CEDA can see whether its programmes reach everyone.</li>
            </ul>
            <p className="mt-2">We do not collect sensitive data such as health, religion or biometrics.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-navy-900">Your consent</h2>
            <ul className="mt-2 space-y-2">
              {Object.values(CONSENT_PURPOSES).map((c) => (
                <li key={c.label}><span className="font-semibold">{c.label}{c.required ? " (required)" : " (optional)"}:</span> {c.detail}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-navy-900">Who sees your idea</h2>
            <p className="mt-2">Only the CEDA programme team, evaluators assigned to your idea and the innovation committee. Evaluators sign a conflict-of-interest declaration and see your idea without your name during blind review. Every view and decision is recorded in an audit trail.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-navy-900">How long we keep it</h2>
            <p className="mt-2">Applications that are not selected are anonymised 24 months after the call closes. Awarded applications are kept for the life of CEDA's support and the period the law requires. Audit records are kept for 7 years.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-navy-900">Where it is stored</h2>
            <p className="mt-2">Arena is designed to run on servers in Botswana. Data is not transferred abroad unless the Act allows it. Files are encrypted at rest and all traffic uses HTTPS.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-navy-900">Your rights</h2>
            <p className="mt-2">You can ask to see, correct, move, restrict or erase your data, object to processing, and ask for a person to review any decision. Use the privacy centre in your account; CEDA aims to respond within 30 days. If a breach puts your data at risk, we will tell the Commission without delay and, where feasible, within 72 hours, and tell you if the risk is high.</p>
          </section>
        </div>
      </article>
      <PublicFooter />
    </div>
  );
}
