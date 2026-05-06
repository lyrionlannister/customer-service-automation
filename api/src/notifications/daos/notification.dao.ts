import { Repository } from "typeorm";
import { Notification } from "../entities/notification.entity.js";
import { BaseDao } from "../../daos/base.dao.js";

export class NotificationDao extends BaseDao<Notification> {
  constructor(repository: Repository<Notification>) {
    super(repository);
  }

  async findAllOrdered(unreadOnly = false): Promise<Notification[]> {
    const where = unreadOnly ? { read: false } : {};
    return this.repository.find({
      where,
      order: { createdAt: "DESC" },
      take: 50,
    });
  }

  async markAllRead(): Promise<void> {
    await this.repository.update({ read: false }, { read: true });
  }
}
