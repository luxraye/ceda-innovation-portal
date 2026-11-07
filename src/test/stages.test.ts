import { describe, expect, it } from "vitest";
import { allowedTransitions } from "@/lib/stages";

describe("allowedTransitions", () => {
  it("lets evaluators move submitted ideas forward but not award them", () => {
    const t = allowedTransitions(["evaluator"], "submitted");
    expect(t).toContain("screening");
    expect(t).not.toContain("awarded");
  });
  it("lets adjudicators award approved ideas", () => {
    expect(allowedTransitions(["adjudicator"], "approved")).toContain("awarded");
  });
  it("gives submitters no staff transitions", () => {
    expect(allowedTransitions(["submitter"], "submitted")).toEqual([]);
  });
});
