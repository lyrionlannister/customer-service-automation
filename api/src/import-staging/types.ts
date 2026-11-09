export interface StagingRow {
  brand: string;
  model: string;
  price: number;
}

export type StagingStatus = "processing" | "ready" | "error";

export interface StagingRecord {
  importId: string;
  tenantId: string;
  supplierId: string;
  status: StagingStatus;
  rows: StagingRow[];
  error?: string;
  createdAt: string;
}

/** Subconjunto de ioredis que la service necesita -- permite mockear en tests sin un Redis real. */
export interface RedisLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode: "EX", seconds: number): Promise<unknown>;
  del(key: string): Promise<unknown>;
}
