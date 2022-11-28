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

// const redisClient = redis.createClient({
//     socket: {
//         port: REDIS_CONFIG.port,
//         host: REDIS_CONFIG.host,
//         tls: true,
//         ca: fs.readFileSync(
//             './config/redisSSL/ca.crt',
//             {encoding: 'ascii'},
//         ),
//         cert: fs.readFileSync(
//             './config/redisSSL/client.crt',//?
//             {encoding: 'ascii'},
//             // {encoding: 'base64'},
//         ),
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
