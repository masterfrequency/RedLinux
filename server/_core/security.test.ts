import { describe, it, expect } from "vitest";
import { checkPermission, type UserRole } from "./security";

describe("checkPermission", () => {
  const cases: [UserRole, UserRole, boolean][] = [
    // [userRole, requiredRole, expected]
    ["admin", "admin", true],
    ["admin", "operator", true],
    ["admin", "viewer", true],
    ["operator", "operator", true],
    ["operator", "viewer", true],
    ["operator", "admin", false],
    ["viewer", "viewer", true],
    ["viewer", "operator", false],
    ["viewer", "admin", false],
  ];

  it.each(cases)(
    "user=%s required=%s → %s",
    (userRole, requiredRole, expected) => {
      expect(checkPermission(userRole, requiredRole)).toBe(expected);
    },
  );

  it("is reflexive for every role", () => {
    for (const role of ["admin", "operator", "viewer"] as UserRole[]) {
      expect(checkPermission(role, role)).toBe(true);
    }
  });
});
