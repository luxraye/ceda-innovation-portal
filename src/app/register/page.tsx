import Link from "next/link";
import { Logo } from "@/components/logo";
import { RegisterForm } from "./register-form";
import { CONSENT_PURPOSES, CONSENT_VERSION, DISTRICTS, SECTORS } from "@/lib/domain";

export const metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <div className="sky-gradient min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <Logo />
        <div className="card mt-8 p-6 md:p-10">
          <div className="req-badge">3.2(a) · DPA 2024</div>
          <h1 className="mt-3 text-3xl font-bold text-navy-900">Create your Sky account</h1>
          <p className="mt-2 text-sm text-slate-600">
            CEDA innovation calls are for Batswana aged 18 to 35 whose company is more than 50% youth-owned. We check this now so you
            don't spend time on an application that can't be accepted.
          </p>
          <RegisterForm
            districts={[...DISTRICTS]}
            sectors={[...SECTORS]}
            consents={Object.entries(CONSENT_PURPOSES).map(([key, v]) => ({ key, ...v }))}
            consentVersion={CONSENT_VERSION}
          />
          <p className="mt-6 text-sm text-slate-600">
            Already registered? <Link href="/login" className="font-semibold text-sky-700 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
