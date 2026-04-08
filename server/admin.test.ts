import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB ──────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// ─── Context helpers ─────────────────────────────────────────────────────────
function makeAdminCtx(overrides: Partial<TrpcContext["user"]> = {}): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-open-id",
      name: "Admin User",
      email: "admin@grupogab.com",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      ...overrides,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeUserCtx(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "user-open-id",
      name: "Regular User",
      email: "user@grupogab.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("admin router - access control", () => {
  it("should deny access to non-admin users on stats", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.admin.stats()).rejects.toThrow("Acesso restrito a administradores.");
  });

  it("should deny access to non-admin users on listUsers", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.admin.listUsers()).rejects.toThrow("Acesso restrito a administradores.");
  });

  it("should deny access to non-admin users on listLogs", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.admin.listLogs()).rejects.toThrow("Acesso restrito a administradores.");
  });

  it("should deny access to non-admin users on logStats", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.admin.logStats()).rejects.toThrow("Acesso restrito a administradores.");
  });
});

describe("admin router - stats (no DB)", () => {
  it("should return zero stats when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const stats = await caller.admin.stats();
    expect(stats).toMatchObject({
      totalUsers: 0,
      activeUsers: 0,
      adminUsers: 0,
      totalLogs: 0,
      recentActions: 0,
    });
  });
});

describe("admin router - listUsers (no DB)", () => {
  it("should return empty array when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const users = await caller.admin.listUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(0);
  });
});

describe("admin router - listLogs (no DB)", () => {
  it("should return empty logs and zero total when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.listLogs();
    expect(result).toMatchObject({ logs: [], total: 0 });
  });
});

describe("admin router - logStats (no DB)", () => {
  it("should return empty arrays when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.logStats();
    expect(result).toMatchObject({ byModule: [], byStatus: [], byDay: [] });
  });
});

describe("admin router - updateUserRole validation", () => {
  it("should reject when admin tries to change their own role", async () => {
    const caller = appRouter.createCaller(makeAdminCtx({ id: 1 }));
    await expect(
      caller.admin.updateUserRole({ userId: 1, role: "user" })
    ).rejects.toThrow("Você não pode alterar sua própria role.");
  });
});

describe("admin router - deleteUser validation", () => {
  it("should reject when admin tries to delete their own account", async () => {
    const caller = appRouter.createCaller(makeAdminCtx({ id: 1 }));
    await expect(
      caller.admin.deleteUser({ userId: 1 })
    ).rejects.toThrow("Você não pode excluir sua própria conta.");
  });
});

describe("admin router - writeLog (protected procedure)", () => {
  it("should reject unauthenticated calls", async () => {
    const unauthCtx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(unauthCtx);
    await expect(
      caller.admin.writeLog({ action: "TEST", module: "test", status: "success" })
    ).rejects.toThrow();
  });
});
