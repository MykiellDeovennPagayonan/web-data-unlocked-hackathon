import { describe, it, expect } from "vitest";
import { formatSigned } from "./admin-dashboard";

describe("formatSigned", () => {
  it("should prefix positive numbers with a plus sign", () => {
    expect(formatSigned(5)).toBe("+5");
    expect(formatSigned(1)).toBe("+1");
    expect(formatSigned(0.5)).toBe("+0.5");
  });

  it("should keep the minus sign for negative numbers", () => {
    expect(formatSigned(-5)).toBe("-5");
    expect(formatSigned(-1)).toBe("-1");
    expect(formatSigned(-0.5)).toBe("-0.5");
  });

  it("should return '0' for zero", () => {
    expect(formatSigned(0)).toBe("0");
  });
});
