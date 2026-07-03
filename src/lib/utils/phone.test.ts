import { describe, expect, it } from "vitest";
import {
  formatGuatemalaPhoneDisplay,
  normalizeGuatemalaPhone,
  phoneToWhatsAppDigits,
} from "./phone";

describe("normalizeGuatemalaPhone", () => {
  it("accepts 8-digit local numbers", () => {
    expect(normalizeGuatemalaPhone("55501234")).toBe("50255501234");
    expect(normalizeGuatemalaPhone("5550-1234")).toBe("50255501234");
  });

  it("accepts 502 prefix", () => {
    expect(normalizeGuatemalaPhone("50255501234")).toBe("50255501234");
    expect(normalizeGuatemalaPhone("+502 5550 1234")).toBe("50255501234");
  });

  it("rejects invalid numbers", () => {
    expect(normalizeGuatemalaPhone("123")).toBeNull();
    expect(normalizeGuatemalaPhone("123456789")).toBeNull();
    expect(normalizeGuatemalaPhone("155501234")).toBeNull();
  });
});

describe("phoneToWhatsAppDigits", () => {
  it("returns digits for wa.me", () => {
    expect(phoneToWhatsAppDigits("55501234")).toBe("50255501234");
  });
});

describe("formatGuatemalaPhoneDisplay", () => {
  it("formats for display", () => {
    expect(formatGuatemalaPhoneDisplay("50255501234")).toBe("5550-1234");
  });
});
