import { describe, expect, it, vi } from "vitest";
import { isJwtExpired } from "@/lib/jwt";
import { isUnreadNotification, notificationResolutionLabel } from "@/models/notification.model";

const token = (payload: unknown) => `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;

describe("Estado local de sessão", () => {
  it("considera a fronteira exata de expiração", () => {
    vi.useFakeTimers();
    vi.setSystemTime(100000);
    expect(isJwtExpired(token({ exp: 101 }))).toBe(false);
    expect(isJwtExpired(token({ exp: 100 }))).toBe(true);
    expect(isJwtExpired(token({ exp: 99 }))).toBe(true);
    expect(isJwtExpired(null)).toBe(true);
  });
  it("deixa a verificação da assinatura e tokens não interpretáveis para a API", () => {
    expect(isJwtExpired(token({ email: "user@example.test" }))).toBe(false);
    expect(isJwtExpired("invalid-token")).toBe(false);
  });
});

describe("Estado dos lembretes", () => {
  it("avisos resolvidos e lidos não contam como novos", () => {
    expect(isUnreadNotification({ read: false })).toBe(true);
    expect(isUnreadNotification({ read: true })).toBe(false);
    expect(isUnreadNotification({ read: false, resolvedAt: "2026-10-15" })).toBe(false);
    expect(notificationResolutionLabel({ read: true })).toBeNull();
  });
});
