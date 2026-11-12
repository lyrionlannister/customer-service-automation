import { Repository } from "typeorm";
import { Local } from "../entities/local.entity.js";
import { TenantScopedDao } from "../../daos/tenant-scoped.dao.js";

export class LocalDao extends TenantScopedDao<Local> {
  constructor(repository: Repository<Local>) {
    super(repository);
  }

  // Dedicated queryRunner per raw query so this grabs its own connection
  // from the pool — repository.query() alone can silently queue concurrent
  // calls on a single shared client instead of pooling.
  //
  // queryRunner.query() does NOT return a consistent shape: for this same
  // Postgres driver, an INSERT ... RETURNING resolves to the rows array
  // directly, while an UPDATE ... RETURNING resolves to a [rows, rowCount]
  // tuple — confirmed empirically, not documented. Normalize both here
  // instead of assuming one shape per call site.
  private async runQuery<T>(sql: string, params: unknown[]): Promise<T[]> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    try {
      const result = await queryRunner.query(sql, params);
      return Array.isArray(result[0]) ? result[0] : result;
    } finally {
      await queryRunner.release();
    }
  }

  async findOrCreate(): Promise<Local> {
    // Upsert atomico: dos llamadas concurrentes para el mismo tenant (p.ej.
    // dos consumeControlNumber() a la vez con el local aun no creado) no
    // deben insertar dos filas y chocar contra el unique(tenant_id) -- el
    // SELECT-then-INSERT que tenia antes sí corria esa carrera.
    const tenantId = this.currentTenantId();
    const rows = await this.runQuery<Partial<Local>>(
      `INSERT INTO local_config ("tenant_id", "siguiente_numero_control")
       VALUES ($1, 1)
       ON CONFLICT ("tenant_id") DO UPDATE SET "tenant_id" = EXCLUDED."tenant_id"
       RETURNING
         "id" AS id,
         "public_id" AS "publicId",
         "tenant_id" AS "tenantId",
         "nombre" AS name,
         "direccion" AS address,
         "telefono" AS phone,
         "logo" AS logo,
         "siguiente_numero_control" AS "nextControlNumber",
         "unidad_redondeo_caja" AS "cashRoundingUnit",
         "fecha_creacion" AS "createdAt",
         "fecha_actualizacion" AS "updatedAt"`,
      [tenantId],
    );
    return this.repository.create(rows[0]);
  }

  async consumeControlNumber(): Promise<number> {
    const local = await this.findOrCreate();
    const rows = await this.runQuery<{ number: number }>(
      `UPDATE local_config
       SET "siguiente_numero_control" = "siguiente_numero_control" + 1
       WHERE "id" = $1
       RETURNING "siguiente_numero_control" - 1 AS number`,
      [local.id],
    );
    return rows[0].number;
  }
}
