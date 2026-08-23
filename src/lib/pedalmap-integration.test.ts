import { describe, expect, it } from "vitest";
import { parsePedalMapContext, extractRouteSummary, applyPedalMapContext } from "@/lib/pedalmap-integration";

describe("pedalmap integration", () => {
  describe("parsePedalMapContext", () => {
    it("returns null when source is not pedalmap", () => {
      const params = new URLSearchParams("?sport=cycling&durationMinutes=180");
      expect(parsePedalMapContext(params)).toBeNull();
    });

    it("returns null when sport is missing", () => {
      const params = new URLSearchParams("?source=pedalmap&durationMinutes=180");
      expect(parsePedalMapContext(params)).toBeNull();
    });

    it("parses a complete valid URL", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&distanceKm=58.4&elevationGainM=620&durationMinutes=167&temperatureC=26");
      const ctx = parsePedalMapContext(params);
      expect(ctx).not.toBeNull();
      expect(ctx?.sport).toBe("cycling");
      expect(ctx?.distanceKm).toBe(58.4);
      expect(ctx?.elevationGainM).toBe(620);
      expect(ctx?.durationMinutes).toBe(167);
      expect(ctx?.temperatureC).toBe(26);
    });

    it("ignores invalid sport values", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=invalid&durationMinutes=180");
      const ctx = parsePedalMapContext(params);
      expect(ctx?.sport).toBe("invalid");
    });

    it("normalizes sport aliases", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=bici&durationMinutes=180");
      const ctx = parsePedalMapContext(params);
      expect(ctx?.sport).toBe("cycling");
    });

    it("clamps distance to valid range", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&distanceKm=-10&durationMinutes=180");
      const ctx = parsePedalMapContext(params);
      expect(ctx?.distanceKm).toBeUndefined();
    });

    it("clamps elevation to valid range", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&elevationGainM=9000&durationMinutes=180");
      const ctx = parsePedalMapContext(params);
      expect(ctx?.elevationGainM).toBeUndefined();
    });

    it("clamps temperature to valid range", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&temperatureC=100&durationMinutes=180");
      const ctx = parsePedalMapContext(params);
      expect(ctx?.temperatureC).toBeUndefined();
    });

    it("parses intensity alias", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&intensity=suave&durationMinutes=180");
      const ctx = parsePedalMapContext(params);
      expect(ctx?.intensity).toBe("easy");
    });

    it("parses goal alias", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&goal=competir&durationMinutes=180");
      const ctx = parsePedalMapContext(params);
      expect(ctx?.goal).toBe("perform");
    });

    it("ignores invalid intensity", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&intensity=super&durationMinutes=180");
      const ctx = parsePedalMapContext(params);
      expect(ctx?.intensity).toBeUndefined();
    });

    it("ignores NaN values", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&distanceKm=abc&durationMinutes=180");
      const ctx = parsePedalMapContext(params);
      expect(ctx?.distanceKm).toBeUndefined();
    });

    it("ignores infinite values", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&distanceKm=Infinity&durationMinutes=180");
      const ctx = parsePedalMapContext(params);
      expect(ctx?.distanceKm).toBeUndefined();
    });

    it("parses departureTime as ISO string", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&departureTime=2026-08-22T08:00:00Z&durationMinutes=180");
      const ctx = parsePedalMapContext(params);
      expect(ctx?.departureTime).toBe("2026-08-22T08:00:00.000Z");
    });

    it("ignores invalid departureTime", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&departureTime=not-a-date&durationMinutes=180");
      const ctx = parsePedalMapContext(params);
      expect(ctx?.departureTime).toBeUndefined();
    });
  });

  describe("extractRouteSummary", () => {
    it("returns null when context is null", () => {
      expect(extractRouteSummary(null)).toBeNull();
    });

    it("extracts route summary from context", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&distanceKm=58.4&elevationGainM=620&durationMinutes=167&temperatureC=26");
      const ctx = parsePedalMapContext(params);
      const summary = extractRouteSummary(ctx);
      expect(summary).toEqual({
        distanceKm: 58.4,
        elevationGainM: 620,
        durationMinutes: 167,
        temperatureC: 26,
      });
    });

    it("returns partial summary when some fields are missing", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&durationMinutes=167&temperatureC=26");
      const ctx = parsePedalMapContext(params);
      const summary = extractRouteSummary(ctx);
      expect(summary).toEqual({
        distanceKm: undefined,
        elevationGainM: undefined,
        durationMinutes: 167,
        temperatureC: 26,
      });
    });
  });

  describe("applyPedalMapContext", () => {
    it("returns fallback when context is null", () => {
      const fallback = { sport: "running" as const, durationMinutes: 90 };
      const result = applyPedalMapContext(null, fallback);
      expect(result).toEqual(fallback);
    });

    it("applies valid context fields", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&distanceKm=58.4&elevationGainM=620&durationMinutes=167&temperatureC=26&intensity=hard&goal=perform&bodyMassKg=70&sweatRateLPerHour=1.5");
      const ctx = parsePedalMapContext(params);
      const result = applyPedalMapContext(ctx, { sport: "running", durationMinutes: 90, intensity: "moderate", bodyMassKg: 75, temperatureC: 25, goal: "train", fuelPreference: "mixed", availableFoodIds: [] });
      expect(result.sport).toBe("cycling");
      expect(result.distanceKm).toBe(58.4);
      expect(result.elevationGainM).toBe(620);
      expect(result.durationMinutes).toBe(167);
      expect(result.temperatureC).toBe(26);
      expect(result.intensity).toBe("hard");
      expect(result.goal).toBe("perform");
      expect(result.bodyMassKg).toBe(70);
      expect(result.sweatRateLPerHour).toBe(1.5);
    });

    it("clamps duration to valid range", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&durationMinutes=2000");
      const ctx = parsePedalMapContext(params);
      const result = applyPedalMapContext(ctx, {});
      expect(result.durationMinutes).toBe(720);
    });

    it("ignores invalid fields in context", () => {
      const params = new URLSearchParams("?source=pedalmap&sport=cycling&distanceKm=-5&durationMinutes=180");
      const ctx = parsePedalMapContext(params);
      const result = applyPedalMapContext(ctx, {});
      expect(result.distanceKm).toBeUndefined();
    });
  });
});
