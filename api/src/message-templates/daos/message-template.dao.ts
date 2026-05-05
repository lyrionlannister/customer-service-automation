import { Repository } from "typeorm";
import { MessageTemplate } from "../entities/message-template.entity.js";
import { BaseDao } from "../../daos/base.dao.js";

export class MessageTemplateDao extends BaseDao<MessageTemplate> {
  constructor(repository: Repository<MessageTemplate>) {
    super(repository);
  }

  async findByKey(key: string): Promise<MessageTemplate | null> {
    return this.repository.findOneBy({ key });
  }

  async findAllOrdered(): Promise<MessageTemplate[]> {
    return this.repository.find({ order: { key: "ASC" } });
  }
}
