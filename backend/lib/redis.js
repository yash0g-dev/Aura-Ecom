import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUri = process.env.UPSTASH_REDIS_URI;

// Defensive Check: Warn the developer if they grabbed the wrong string from Upstash
if (redisUri && redisUri.startsWith("https")) {
  console.error("❌ CONFIG ERROR: You passed an HTTP/REST URL to ioredis!");
  console.error(
    "   Please update UPSTASH_REDIS_URI in your .env to use the 'redis://' or 'rediss://' protocol.",
  );
}

export const redis = new Redis(redisUri, {
  // Prevent infinite, aggressive block loops if the database is unreachable
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) {
      console.error(
        "❌ Redis connection failed permanently. Bypassing cache layer.",
      );
      return null; // Stops retrying so your Express app can live!
    }
    return Math.min(times * 100, 2000);
  },
});

// THE EMERGENCY SHIELD: Captures the error that was paralyzing your server threads
redis.on("error", (err) => {
  console.error("⚠️ Redis Cache Connection Stalled:", err.message);
});

redis.on("connect", () => {
  console.log("⚡ Redis cache connected successfully!");
});
