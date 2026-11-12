import { AsyncLocalStorage } from "node:async_hooks";

interface TenantScope {
  tenantId: string | null;
  isSystemScope: boolean;
}

export class TenantContextError extends Error {}

const storage = new AsyncLocalStorage<TenantScope>();

export function runWithTenant<T>(tenantId: string, fn: () => T): T {
  return storage.run({ tenantId, isSystemScope: false }, fn);
}

// Bypass explícito del filtro de tenant. Usar solo para operaciones de
// sistema de verdad (seeds, callbacks sin JWT que ya validaron el tenant
// por otra vía) — nunca como atajo para "no sé qué tenant es".
export function allowSystemScope<T>(fn: () => T): T {
  return storage.run({ tenantId: null, isSystemScope: true }, fn);
}

export function getCurrentTenantId(): string {
  const scope = storage.getStore();
  if (!scope) {
    throw new TenantContextError(
      "No hay tenant en contexto. Usa runWithTenant() o, si de verdad es una " +
        "operacion de sistema, allowSystemScope().",
    );
  }
  if (scope.isSystemScope) {
    throw new TenantContextError(
      "El contexto actual es de sistema (sin tenant): esta operacion requiere un tenant.",
    );
  }
  return scope.tenantId as string;
}

export function isSystemScope(): boolean {
  return storage.getStore()?.isSystemScope ?? false;
}
