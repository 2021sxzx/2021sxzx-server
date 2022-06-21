const express = require('express');
const router = express.Router();
const redisClient = require('../config/redis');

const systemMetaService = require('../service/systemMetaService');

function setStatusCode(res, data) {
    if (data.code === 200) {
        res.statusCode = 200
    } else {
        res.statusCode = 404
    }
}

router.get('/v1/test', async (req, res) => {
  // 获取数据库中使用者的数目
  await systemMetaService.networkQualityOfInterface("www.baidu.com");
  res.json(1);
});

module.exports = router;
