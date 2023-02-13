const fs = require('fs')
let MONGO_CONFIG, REDIS_CONFIG, IMG_PATH, TYRZ

// 根据启动环境连接不同的服务
if (process.env.NODE_ENV === 'local') {
    // 本机
    REDIS_CONFIG = {
        host: '127.0.0.1',
        port: '6379',
    }
    MONGO_CONFIG = {
        url: 'mongodb://127.0.0.1:27017/sxzx'
    }
    IMG_PATH = 'http://127.0.0.1:5001/imgs/'
} else if (process.env.NODE_ENV === 'development') {
    // 阿里云
    REDIS_CONFIG = {
        host: '8.134.73.52',
        port: '6379',
        password: 'hgc16711',
    }
    MONGO_CONFIG = {
        url: 'mongodb://root2:Hgc16711@8.134.73.52:27017/sxzx',
        ip: '8.134.73.52',
        port: '27017',
        user: 'root2',
        password: 'Hgc16711',
        dbName: 'sxzx',
        // sslCa:fs.readFileSync('./config/mongodbSSL/ca.pem'),
        // sslKey:fs.readFileSync('./config/mongodbSSL/client.pem'),
        // sslCert:fs.readFileSync('./config/mongodbSSL/client.pem'),
        sslCa: './config/mongodbSSL/ca.pem',
        sslKey: './config/mongodbSSL/client.key',
        sslCert: './config/mongodbSSL/client.crt',
    }
    IMG_PATH = 'http://8.134.73.52:5001/imgs/'
    TYRZ = {
        url: 'http://tyrztest.gd.gov.cn',
        client_id: 'gzznzxpt',
        client_secret: 'fwib5303',
        redirect_url: 'https%3A%2F%2F8.134.49.87%2Fsxzx-qt%2F%23%2F'
    }
} else if (process.env.NODE_ENV === 'production') {
    // 政务云
    REDIS_CONFIG = {
        host: '10.196.133.5',
        port: '6379',
        password: 'hgc16711',
    }
    MONGO_CONFIG = {
        url: 'mongodb://root2:Hgc16711@10.196.133.5:27017/sxzx',
        ip: '10.196.133.5',
        port: '27017',
        user: 'root2',
        password: 'Hgc16711',
        dbName: 'sxzx',
    }
    IMG_PATH = 'http://10.196.133.5:5001/imgs/'
    TYRZ = {
        url: 'https://tyrz.gd.gov.cn',
        client_id: 'tyrz_gzznzxpt',
        client_secret: 'bxcx3434',
        redirect_url: 'https%3A%2F%2Fznzx.rsj.gz.gov.cn%2Fsxzx-qt%2F%23%2F'
    }
}

module.exports = {
    MONGO_CONFIG,
    REDIS_CONFIG,
    IMG_PATH,
    TYRZ
}
