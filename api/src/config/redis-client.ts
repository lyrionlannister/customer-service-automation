import { Redis } from "ioredis";

const redisHost = process.env.REDIS_HOST ?? "redis";
const redisPort = parseInt(process.env.REDIS_PORT ?? "6379", 10);

export const redisClient = new Redis({
  host: redisHost,
  port: redisPort,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
  lazyConnect: true,
});

redisClient.on("error", (err: Error) => {
  console.error("Redis error:", err);
});

redisClient.on("connect", () => {
  console.log(`Redis conectado en ${redisHost}:${redisPort}`);
});
