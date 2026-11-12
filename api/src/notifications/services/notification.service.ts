import { NotificationDao } from "../daos/notification.dao.js";
import { Notification, NotificationType } from "../entities/notification.entity.js";

export class NotificationService {
  constructor(private dao: NotificationDao) {}

  async getAll(unreadOnly = false): Promise<Notification[]> {
    return this.dao.findAllOrdered(unreadOnly);
  }

  async create(data: {
    type: NotificationType;
    sessionId: string;
    phone: string;
    contactName?: string;
  }): Promise<Notification> {
    return this.dao.create({ ...data, read: false });
  }

  async markRead(id: number): Promise<Notification | null> {
    return this.dao.update(id, { read: true });
  }

  async markAllRead(): Promise<void> {
    return this.dao.markAllRead();
  }
}
