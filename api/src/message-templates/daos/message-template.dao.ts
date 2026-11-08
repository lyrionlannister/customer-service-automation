import { Repository } from "typeorm";
import { MessageTemplate } from "../entities/message-template.entity.js";
import { TenantScopedDao } from "../../daos/tenant-scoped.dao.js";

export class MessageTemplateDao extends TenantScopedDao<MessageTemplate> {
  constructor(repository: Repository<MessageTemplate>) {
    super(repository);
  }

  async findByKey(key: string): Promise<MessageTemplate | null> {
    return this.findOne({ key } as Partial<MessageTemplate>);
  }

  async findAllOrdered(): Promise<MessageTemplate[]> {
    return this.scoped().orderBy("entity.key", "ASC").getMany();
  }
}
