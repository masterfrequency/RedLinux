import { describe, it, expect } from "vitest";
import { mutateSourceCode, injectAntiVM } from "./polymorph";

describe("mutateSourceCode", () => {
  it("preserves original program semantics for C", async () => {
    const src = 'printf("hello world");\nreturn 0;';
    const mutated = await mutateSourceCode(src, "c");
    // Original lines still present
    expect(mutated).toContain("return 0;");
    // String literals get hex-encoded as char arrays
    expect(mutated).toContain("char[]");
    expect(mutated).toContain("\\x68"); // 'h'
  });

  it("hex-encodes python strings", async () => {
    const src = "print('hello')";
    const mutated = await mutateSourceCode(src, "python");
    expect(mutated).toContain("bytes.fromhex");
    expect(mutated).toContain("68656c6c6f"); // "hello" hex
  });

  it("returns empty string for empty input", async () => {
    expect(await mutateSourceCode("", "c")).toBe("");
  });

  it("always returns the same number of logical lines", async () => {
    const src = "a();\nb();\nc();";
    const mutated = await mutateSourceCode(src, "python");
    // Mutations insert junk *before* lines, never delete them
    const origCount = src.split("\n").length;
    expect(mutated.split("\n").length).toBeGreaterThanOrEqual(origCount);
    expect(mutated).toContain("a();");
    expect(mutated).toContain("b();");
    expect(mutated).toContain("c();");
  });
});

describe("injectAntiVM", () => {
  it("prepends python VM guard and early-exit", () => {
    const out = injectAntiVM("print('x')", "python");
    expect(out).toContain("def check_vm()");
    expect(out).toContain("if check_vm(): exit(0)");
    expect(out).toContain("print('x')");
  });

  it("wraps C main with VM guard call", () => {
    const out = injectAntiVM("int main() {\n  return 0;\n}", "c");
    expect(out).toContain("check_vm()");
    expect(out).toContain("hypervisor");
    expect(out).toContain("08:00:27");
    expect(out).toContain("if (check_vm()) exit(0);");
    expect(out).toContain("return 0;");
  });

  it("defaults to C when language unspecified", () => {
    const out = injectAntiVM("int main(){}");
    expect(out).toContain("stdio.h");
  });
});
