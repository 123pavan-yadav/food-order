const { createClient } = require('redis');

const redisOptions = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT || 6379),
        tls: process.env.REDIS_TLS === 'true'
      },
      username: process.env.REDIS_USERNAME || undefined,
      password: process.env.REDIS_PASSWORD || undefined
    };

const redisClient = createClient(redisOptions);

redisClient.on('error', (error) => {
  console.error('Redis error:', error.message);
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Connected to Redis');
  }
}

module.exports = { redisClient, connectRedis };

