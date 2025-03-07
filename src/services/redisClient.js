const { createClient } = require('redis');

const redisClient = createClient();

redisClient.on('connect', () => console.log('✅ Connected to Redis!'));
redisClient.on('error', err => console.log('❌ Redis Client Error', err));

(async () => {
    await redisClient.connect();
})();

module.exports = redisClient;