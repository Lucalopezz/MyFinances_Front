import { describe, expect, it, vi } from "vitest";
import { isJwtExpired } from "@/lib/jwt";
import {
  NotificationsType,
  isUnreadNotification,
  notificationResolutionLabel,
} from "@/models/notification.model";

const token = (payload: unknown) =>
  `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;

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
  const notification = {
    id: "notice",
    title: "Aviso",
    message: "Despesa vence hoje",
    type: NotificationsType.REMINDER,
    userId: "user",
    read: false,
  };
  it("avisos resolvidos e lidos não contam como novos", () => {
    expect(isUnreadNotification({ ...notification, read: false })).toBe(true);
    expect(isUnreadNotification({ ...notification, read: true })).toBe(false);
    expect(
      isUnreadNotification({
        ...notification,
        read: false,
        resolvedAt: "2026-10-15",
      }),
    ).toBe(false);
    expect(
      notificationResolutionLabel({ ...notification, read: true }),
    ).toBeNull();
  });
});
