const { createClient } = require('redis');

const isRenderEnvironment = Boolean(process.env.RENDER || process.env.RENDER_EXTERNAL_URL || process.env.RENDER_SERVICE_NAME);
const shouldUseLocalRedisFallback = !isRenderEnvironment && process.env.NODE_ENV !== 'production';

const redisOptions = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : shouldUseLocalRedisFallback
    ? {
        socket: {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT || 6379),
          tls: process.env.REDIS_TLS === 'true'
        },
        username: process.env.REDIS_USERNAME || undefined,
        password: process.env.REDIS_PASSWORD || undefined
      }
    : null;

const redisClient = redisOptions ? createClient(redisOptions) : null;

if (redisClient) {
  redisClient.on('error', (error) => {
    console.error('Redis error:', error.message);
  });
}

function isRedisConfigured() {
  return Boolean(process.env.REDIS_URL || process.env.REDIS_HOST || process.env.REDIS_PORT || (shouldUseLocalRedisFallback && !isRenderEnvironment));
}

async function connectRedis() {
  if (!isRedisConfigured() || !redisClient) {
    console.log('Redis not configured, skipping connection.');
    return null;
  }

  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Connected to Redis');
  }

  return redisClient;
}

module.exports = { redisClient, connectRedis, isRedisConfigured };

