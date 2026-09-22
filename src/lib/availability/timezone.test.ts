import { describe, expect, it } from "vitest";
import {
  formatHHmmTo12h,
  formatSalonTime,
  salonLocalToUtc,
} from "./timezone";

const TZ = "America/Guatemala";

describe("formatSalonTime 12h", () => {
  it("formats afternoon as PM", () => {
    const d = salonLocalToUtc("2026-10-10", "15:00", TZ);
    expect(formatSalonTime(d, TZ)).toBe("3:00 PM");
  });

  it("formats morning as AM", () => {
    const d = salonLocalToUtc("2026-10-10", "09:30", TZ);
    expect(formatSalonTime(d, TZ)).toBe("9:30 AM");
  });

  it("formats noon and midnight", () => {
    expect(formatSalonTime(salonLocalToUtc("2026-10-10", "12:00", TZ), TZ)).toBe(
      "12:00 PM"
    );
    expect(formatSalonTime(salonLocalToUtc("2026-10-10", "00:00", TZ), TZ)).toBe(
      "12:00 AM"
    );
  });
});

describe("formatHHmmTo12h", () => {
  it("converts stored wall-clock times", () => {
    expect(formatHHmmTo12h("14:00:00")).toBe("2:00 PM");
    expect(formatHHmmTo12h("09:00")).toBe("9:00 AM");
    expect(formatHHmmTo12h("12:30")).toBe("12:30 PM");
  });
});
