const redis = require("redis");
const { REDIS_CONFIG } = require("./db"); //redis


const redisClient = redis.createClient(REDIS_CONFIG.port, REDIS_CONFIG.host);

redisClient.on('connect', () => {
})

redisClient.on('error', (error) => {
    console.log('Redis Not Connected!', error);
})

module.exports = redisClient;
