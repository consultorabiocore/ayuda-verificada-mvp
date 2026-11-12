import { describe, expect, test } from "bun:test";
import { formatCLP, progressPct, uid } from "../../src/lib/utils";

describe("utils", () => {
  test("progressPct", () => {
    expect(progressPct(50, 100)).toBe(50);
    expect(progressPct(150, 100)).toBe(100);
    expect(progressPct(0, 100)).toBe(0);
  });
  test("uid unique", () => {
    expect(uid("x")).not.toBe(uid("x"));
  });
  test("formatCLP", () => {
    expect(formatCLP(1000)).toContain("1.000");
  });
});