const express = require('express');
const router = express.Router();

/* 用户相关的路由处理. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
