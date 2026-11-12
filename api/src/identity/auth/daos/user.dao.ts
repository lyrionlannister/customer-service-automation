import { Repository } from "typeorm";
import { User } from "../entities/user.entity.js";
import { TenantScopedDao } from "../../../core/daos/tenant-scoped.dao.js";

export class UserDao extends TenantScopedDao<User> {
  constructor(repository: Repository<User>) {
    super(repository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email } as Partial<User>);
  }

  // Unica excepcion deliberada al filtro de tenant: en login todavia no se
  // sabe a que tenant pertenece el usuario, asi que se busca por email en
  // todos los tenants. Solo usar dentro de allowSystemScope(), nunca para
  // listar/editar datos de negocio.
  async findByEmailAcrossTenants(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email } as any);
  }

  async toggleStatus(id: string): Promise<User | null> {
    const user = await this.findOne({ id } as Partial<User>);
    if (!user) return null;
    user.isActive = !user.isActive;
    return this.repository.save(user);
  }
}
