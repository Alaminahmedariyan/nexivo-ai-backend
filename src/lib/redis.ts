import Redis from "ioredis";
import config from "../app/config";

export const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});
