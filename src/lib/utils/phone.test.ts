import { describe, expect, it } from "vitest";
import {
  formatPhoneDisplay,
  normalizePhone,
  phoneToWhatsAppDigits,
} from "./phone";

describe("normalizePhone", () => {
  it("accepts Guatemala numbers", () => {
    expect(normalizePhone("55501234")).toBe("50255501234");
    expect(normalizePhone("50255501234")).toBe("50255501234");
  });

  it("accepts Honduras numbers", () => {
    expect(normalizePhone("99901234")).toBe("50499901234");
    expect(normalizePhone("50499901234")).toBe("50499901234");
  });

  it("accepts El Salvador numbers", () => {
    expect(normalizePhone("50371234567")).toBe("50371234567");
    expect(normalizePhone("503 7123-4567")).toBe("50371234567");
  });

  it("rejects invalid numbers", () => {
    expect(normalizePhone("123")).toBeNull();
    expect(normalizePhone("155501234")).toBeNull();
  });
});

describe("phoneToWhatsAppDigits", () => {
  it("returns digits for wa.me", () => {
    expect(phoneToWhatsAppDigits("55501234")).toBe("50255501234");
  });
});

describe("formatPhoneDisplay", () => {
  it("formats with country code", () => {
    expect(formatPhoneDisplay("50255501234")).toBe("+502 5550-1234");
  });
});
