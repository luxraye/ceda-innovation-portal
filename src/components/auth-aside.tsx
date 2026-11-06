import { Logo } from "./logo";
import { Globe } from "./globe";

const NONE: { name: string; count: number }[] = [];

/** Night panel beside the sign-in and registration forms. */
export function AuthAside({ title, body }: { title: React.ReactNode; body: string }) {
  return (
    <aside className="night noise relative hidden overflow-hidden lg:flex lg:flex-col">
      <div className="grid-lines absolute inset-0" aria-hidden="true" />
      <Globe districts={NONE} className="absolute right-[-30%] bottom-[-78%] aspect-square w-[150%]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-950/30 to-transparent" aria-hidden="true" />
      <div className="relative z-10 flex h-full flex-col p-10">
        <Logo dark />
        <div className="mt-[14vh] max-w-md">
          <h2 className="text-4xl leading-[1.05] text-white">{title}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/55">{body}</p>
        </div>
      </div>
    </aside>
  );
}
