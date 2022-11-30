const redis = require("redis");
const {REDIS_CONFIG} = require("./config");
const fs = require("fs"); //redis

const ssl = {
    key: fs.readFileSync(
        './config/redisSSL/client.key',
        (encoding = 'ascii'),
    ),
    cert: fs.readFileSync(
        './config/redisSSL/client.crt',
        (encoding = 'ascii'),
    ),
    ca: [fs.readFileSync('./config/redisSSL/ca.crt', (encoding = 'ascii'))],
    checkServerIdentity: () => {
        return null;
    },
}

// SSL连接
// const redisClient = redis.createClient({
//     socket: {
//         port: REDIS_CONFIG.port,
//         host: REDIS_CONFIG.host,
//         tls: true,
//         key: fs.readFileSync(
//             './config/redisSSL/redis.key',
//             {encoding: 'ascii'},
//         ),
//         ca: fs.readFileSync(
//             './config/redisSSL/ca.crt',
//             {encoding: 'ascii'},
//         ),
//         cert: fs.readFileSync(
//             './config/redisSSL/redis.crt',
//             {encoding: 'ascii'},
//             // {encoding: 'base64'},
//         ),
//         rejectUnauthorized:false
//     },
//     password: REDIS_CONFIG.password,
// })


const redisClient = redis.createClient({
    socket: {
        port: REDIS_CONFIG.port,
        host: REDIS_CONFIG.host
    },
    password: REDIS_CONFIG.password,
});

// redisClient.on('connect', () => {
//     console.log("redis连接成功");
// })
//

// redisClient.on('error', (error) => {
//     console.log('Redis Not Connected!', error);
//
// })


module.exports = redisClient;
