import { describe, expect, it, vi } from "vitest";
import { consumeHandoffFromUrl } from "@/lib/handoff";

describe("handoff", () => {
  it("returns null when no hash", () => {
    delete (globalThis as Record<string, unknown>).window;
    (globalThis as Record<string, unknown>).window = Object.freeze({
      location: { hash: "", href: "https://fuel.pedalmap.es/planner" },
      history: { replaceState: vi.fn() },
    });
    expect(consumeHandoffFromUrl()).toBeNull();
  });

  it("extracts token and cleans hash", () => {
    const replaceState = vi.fn();
    (globalThis as Record<string, unknown>).window = Object.freeze({
      location: {
        hash: "#pm_ct=abc123",
        href: "https://fuel.pedalmap.es/planner#pm_ct=abc123",
      },
      history: { replaceState },
    });
    expect(consumeHandoffFromUrl()).toBe("abc123");
    expect(replaceState).toHaveBeenCalledWith(
      {},
      "",
      "https://fuel.pedalmap.es/planner",
    );
  });

  it("supports encoded token", () => {
    const replaceState = vi.fn();
    (globalThis as Record<string, unknown>).window = Object.freeze({
      location: {
        hash: "#pm_ct=a%20b",
        href: "https://fuel.pedalmap.es/planner#pm_ct=a%20b",
      },
      history: { replaceState },
    });
    expect(consumeHandoffFromUrl()).toBe("a b");
  });

  it("returns null when pm_ct is absent", () => {
    (globalThis as Record<string, unknown>).window = Object.freeze({
      location: { hash: "#other=1", href: "https://fuel.pedalmap.es/planner#other=1" },
      history: { replaceState: vi.fn() },
    });
    expect(consumeHandoffFromUrl()).toBeNull();
  });
});
