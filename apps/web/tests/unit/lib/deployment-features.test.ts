import { describe, expect, it } from "vitest";
import { exportsAvailable } from "@/lib/deployment-features";

describe("exportações no deploy", () => {
  it("oferece exportação direta no Vercel sem worker", () => {
    expect(exportsAvailable({ VERCEL: "1" })).toBe(true);
  });

  it("preserva o fluxo local que já possui worker", () => {
    expect(exportsAvailable({})).toBe(true);
  });
});
