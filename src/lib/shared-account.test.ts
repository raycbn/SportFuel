import { describe, expect, it } from "vitest";
import { buildSharedAccountSignInPath } from "@/lib/shared-account";

describe("shared PedalMap account route", () => {
  it("routes the monthly selection through Fuel's shared-account sign-in and back to Premium", () => {
    const path = buildSharedAccountSignInPath("month");
    const url = new URL(path, "https://fuel.pedalmap.es");
    expect(url.origin).toBe("https://fuel.pedalmap.es");
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("shared")).toBe("1");
    expect(url.searchParams.get("next")).toBe("/premium?interval=month");
  });

  it("keeps the annual selection by default", () => {
    const url = new URL(buildSharedAccountSignInPath(), "https://fuel.pedalmap.es");
    expect(url.searchParams.get("next")).toBe("/premium?interval=year");
  });
});