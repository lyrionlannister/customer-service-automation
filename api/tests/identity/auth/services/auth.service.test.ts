import { hash } from "bcryptjs";
import { describe, expect, it, vi } from "vitest";
import { AuthService } from "../../../../src/identity/auth/services/auth.service.js";
import type { UserDao } from "../../../../src/identity/auth/daos/user.dao.js";
import type { User } from "../../../../src/identity/auth/entities/user.entity.js";
import type { Repository } from "typeorm";
import type { Tenant } from "../../../../src/core/tenancy/entities/tenant.entity.js";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    tenantId: "11111111-1111-1111-1111-111111111111",
    role: "owner",
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    password: "",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User;
}

function makeTenantRepository(): Repository<Tenant> {
  return {
    create: vi.fn((data: any) => data),
    save: vi.fn((tenant: any) =>
      Promise.resolve({ id: "11111111-1111-1111-1111-111111111111", ...tenant }),
    ),
  } as unknown as Repository<Tenant>;
}

describe("AuthService.login", () => {
  it("rejects an email that isn't registered", async () => {
    const userDao = {
      findByEmailAcrossTenants: vi.fn().mockResolvedValue(null),
    } as unknown as UserDao;
    const service = new AuthService(userDao, makeTenantRepository());

    await expect(
      service.login({ email: "nobody@example.com", password: "whatever" }),
    ).rejects.toThrow("Email no registrado");
  });

  it("rejects an incorrect password", async () => {
    const hashed = await hash("correct-password", 10);
    const userDao = {
      findByEmailAcrossTenants: vi.fn().mockResolvedValue(makeUser({ password: hashed })),
    } as unknown as UserDao;
    const service = new AuthService(userDao, makeTenantRepository());

    await expect(
      service.login({ email: "admin@example.com", password: "wrong-password" }),
    ).rejects.toThrow("Contraseña invalida");
  });

  it("rejects an inactive user even with the correct password", async () => {
    const hashed = await hash("correct-password", 10);
    const userDao = {
      findByEmailAcrossTenants: vi
        .fn()
        .mockResolvedValue(makeUser({ password: hashed, isActive: false })),
    } as unknown as UserDao;
    const service = new AuthService(userDao, makeTenantRepository());

    await expect(
      service.login({ email: "admin@example.com", password: "correct-password" }),
    ).rejects.toThrow("Usuario inactivo");
  });

  it("returns a token and strips the password on a correct login", async () => {
    const hashed = await hash("correct-password", 10);
    const userDao = {
      findByEmailAcrossTenants: vi.fn().mockResolvedValue(makeUser({ password: hashed })),
    } as unknown as UserDao;
    const service = new AuthService(userDao, makeTenantRepository());

    const result = await service.login({
      email: "admin@example.com",
      password: "correct-password",
    });

    expect(result.token).toEqual(expect.any(String));
    expect(result.user).not.toHaveProperty("password");
    expect(result.user.email).toBe("admin@example.com");
  });
});

describe("AuthService.register", () => {
  it("creates a new tenant and makes the registering user its owner", async () => {
    const create = vi.fn().mockImplementation((data) => Promise.resolve(makeUser(data)));
    const userDao = {
      findByEmail: vi.fn().mockResolvedValue(null),
      create,
    } as unknown as UserDao;
    const tenantRepository = makeTenantRepository();
    const service = new AuthService(userDao, tenantRepository);

    await service.register({
      firstName: "New",
      lastName: "User",
      email: "new@example.com",
      password: "plain-text-password",
    });

    expect(tenantRepository.save).toHaveBeenCalledOnce();
    const persisted = create.mock.calls[0][0];
    expect(persisted.role).toBe("owner");
    expect(persisted.password).not.toBe("plain-text-password");
  });

  it("rejects a duplicate email within the newly created tenant", async () => {
    const userDao = {
      findByEmail: vi.fn().mockResolvedValue(makeUser()),
      create: vi.fn(),
    } as unknown as UserDao;
    const service = new AuthService(userDao, makeTenantRepository());

    await expect(
      service.register({
        firstName: "Another",
        lastName: "User",
        email: "admin@example.com",
        password: "whatever123",
      }),
    ).rejects.toThrow("Email ya registrado");
  });
});

describe("AuthService.createEmployee", () => {
  it("creates an employee under the current tenant, never a new one", async () => {
    const create = vi.fn().mockImplementation((data) => Promise.resolve(makeUser(data)));
    const userDao = {
      findByEmail: vi.fn().mockResolvedValue(null),
      create,
    } as unknown as UserDao;
    const service = new AuthService(userDao, makeTenantRepository());

    await service.createEmployee({
      firstName: "Tech",
      lastName: "One",
      email: "tech@example.com",
      password: "plain-text-password",
      role: "employee",
      salaryAmount: 4500,
      payCycle: "weekly",
    });

    const persisted = create.mock.calls[0][0];
    expect(persisted.role).toBe("employee");
    expect(persisted.salaryAmount).toBe(4500);
    expect(persisted.payCycle).toBe("weekly");
    expect(persisted.password).not.toBe("plain-text-password");
  });

  it("rejects a duplicate email within the tenant", async () => {
    const userDao = {
      findByEmail: vi.fn().mockResolvedValue(makeUser()),
      create: vi.fn(),
    } as unknown as UserDao;
    const service = new AuthService(userDao, makeTenantRepository());

    await expect(
      service.createEmployee({
        firstName: "Dup",
        lastName: "User",
        email: "admin@example.com",
        password: "whatever123",
      }),
    ).rejects.toThrow("Email ya registrado");
  });
});

describe("AuthService.listEmployees", () => {
  it("only returns the fields a <Select> needs", async () => {
    const userDao = {
      findAll: vi.fn().mockResolvedValue([makeUser({ id: "1" }), makeUser({ id: "2", role: "employee" })]),
    } as unknown as UserDao;
    const service = new AuthService(userDao, makeTenantRepository());

    const employees = await service.listEmployees();

    expect(employees).toEqual([
      { id: "1", firstName: "Admin", lastName: "User", role: "owner" },
      { id: "2", firstName: "Admin", lastName: "User", role: "employee" },
    ]);
  });
});
