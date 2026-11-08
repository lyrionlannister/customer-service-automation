import { Repository } from "typeorm";
import { Local } from "../entities/local.entity.js";
import { BaseDao } from "../../daos/base.dao.js";

export class LocalDao extends BaseDao<Local> {
  constructor(repository: Repository<Local>) {
    super(repository);
  }

  async findOrCreate(): Promise<Local> {
    const [existing] = await this.repository.find({ take: 1 });
    if (existing) return existing;
    const created = this.repository.create({ nextControlNumber: 1 });
    return this.repository.save(created);
  }

  async consumeControlNumber(): Promise<number> {
    const local = await this.findOrCreate();
    const number = local.nextControlNumber;
    await this.repository.update({ id: local.id }, { nextControlNumber: number + 1 } as any);
    return number;
  }
}
