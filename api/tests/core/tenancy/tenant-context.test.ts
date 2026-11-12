import { describe, expect, it } from "vitest";
import {
  TenantContextError,
  allowSystemScope,
  getCurrentTenantId,
  isSystemScope,
  runWithTenant,
} from "../../../src/core/tenancy/tenant-context.js";

describe("tenant-context", () => {
  it("throws when nothing set the tenant", () => {
    expect(() => getCurrentTenantId()).toThrow(TenantContextError);
  });

  it("returns the tenant id set by runWithTenant", () => {
    runWithTenant("tenant-a", () => {
      expect(getCurrentTenantId()).toBe("tenant-a");
    });
  });

  it("isolates tenant context across nested/sequential calls", () => {
    runWithTenant("tenant-a", () => {
      expect(getCurrentTenantId()).toBe("tenant-a");
    });
    runWithTenant("tenant-b", () => {
      expect(getCurrentTenantId()).toBe("tenant-b");
    });
  });

  it("propagates the tenant across an async chain started inside runWithTenant", async () => {
    const seen = await runWithTenant("tenant-async", async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      return getCurrentTenantId();
    });
    expect(seen).toBe("tenant-async");
  });

  it("allowSystemScope bypasses the tenant requirement but blocks getCurrentTenantId", () => {
    allowSystemScope(() => {
      expect(isSystemScope()).toBe(true);
      expect(() => getCurrentTenantId()).toThrow(TenantContextError);
    });
  });

  it("isSystemScope is false outside any scope and inside a real tenant", () => {
    expect(isSystemScope()).toBe(false);
    runWithTenant("tenant-a", () => {
      expect(isSystemScope()).toBe(false);
    });
  });
});
