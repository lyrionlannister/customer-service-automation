import { redisClient } from "../../core/config/redis-client.js";
import AppDataSource from "../../core/config/data-source.js";
import { Notification } from "../../messaging/notifications/entities/notification.entity.js";

const HUMAN_MODE_TTL_SECONDS = 86400; // 24 horas

class HumanModeService {
  private key(phone: string): string {
    return `human_mode:${phone}`;
  }

  async isActive(phone: string): Promise<boolean> {
    const val = await redisClient.get(this.key(phone));
    return val === "true";
  }

  async activate(phone: string, contactName?: string): Promise<void> {
    await redisClient.set(this.key(phone), "true", "EX", HUMAN_MODE_TTL_SECONDS);
    await AppDataSource.getRepository(Notification).save({
      type: "conversation_transferred" as const,
      sessionId: phone,
      phone,
      contactName: contactName ?? undefined,
      read: false,
    });
  }

  async deactivate(phone: string): Promise<void> {
    await redisClient.del(this.key(phone));
  }
}

export const humanModeService = new HumanModeService();
