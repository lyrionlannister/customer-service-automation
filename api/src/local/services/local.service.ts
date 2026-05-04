import { LocalDao } from "../daos/local.dao.js";
import { Local } from "../entities/local.entity.js";

export class LocalService {
  constructor(private localDao: LocalDao) {}

  async getConfig(): Promise<Local> {
    return this.localDao.findOrCreate();
  }

  async updateConfig(data: Partial<Local>): Promise<Local> {
    const local = await this.localDao.findOrCreate();
    return (await this.localDao.update(local.id, data)) as Local;
  }

  async consumeControlNumber(): Promise<number> {
    return this.localDao.consumeControlNumber();
  }
}
