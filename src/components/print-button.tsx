"use client";
export function PrintButton() {
  return <button className="btn-ghost py-2" onClick={() => window.print()}>Print or save as PDF</button>;
}
