import Redis from "ioredis";
import { env } from "./env";

let redis = null;

if (env.redisUrl) {
  redis = new Redis(env.redisUrl, { maxRetriesPerRequest: 1, enableOfflineQueue: false });
  redis.on("error", () => {});
}

export { redis };

