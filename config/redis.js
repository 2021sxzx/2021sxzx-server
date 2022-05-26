const redis = require("redis");
const { REDIS_CONFIG } = require("./db"); //redis


const redisClient = redis.createClient({
    socket: {
        port: REDIS_CONFIG.port,
        host: REDIS_CONFIG.host
    },
    password: REDIS_CONFIG.password
  });

redisClient.on('connect', () => {
    console.log(123);
})

redisClient.on('error', (error) => {
    console.log('Redis Not Connected!', error);
})

module.exports = redisClient;
