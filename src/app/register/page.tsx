import Link from "next/link";
import { Logo } from "@/components/logo";
import { RegisterForm } from "./register-form";
import { AuthAside } from "@/components/auth-aside";
import { CONSENT_PURPOSES, CONSENT_VERSION, DISTRICTS, SECTORS } from "@/lib/domain";

export const metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[0.9fr_1.2fr]">
      <div className="relative hidden lg:block">
        <div className="sticky top-0 grid h-screen">
          <AuthAside
            title={
              <>
                Bring your idea <span className="font-serif text-[1.08em] text-sky-300 italic">into the light.</span>
              </>
            }
            body="CEDA innovation calls are for Batswana aged 18 to 35 whose company is more than 50% youth-owned. We check this now so you don't spend time on an application that can't be accepted."
          />
        </div>
      </div>
      <main className="px-4 py-12 md:px-10 lg:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="lg:hidden">
            <Logo />
          </div>
          <span className="req-badge mt-10 lg:mt-0">3.2(a) · DPA 2024</span>
          <h1 className="mt-4 text-3xl text-navy-950 md:text-4xl">Create your Arena account</h1>
          <p className="mt-2 text-sm text-slate-500 lg:hidden">
            For Batswana aged 18 to 35 whose company is more than 50% youth-owned.
          </p>
          <RegisterForm
            districts={[...DISTRICTS]}
            sectors={[...SECTORS]}
            consents={Object.entries(CONSENT_PURPOSES).map(([key, v]) => ({ key, ...v }))}
            consentVersion={CONSENT_VERSION}
          />
          <p className="mt-6 text-sm text-slate-500">
            Already registered? <Link href="/login" className="font-medium text-sky-700 hover:underline">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
