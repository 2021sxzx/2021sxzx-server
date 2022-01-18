const express = require('express');
const router = express.Router();
const roleService = require('../service/roleService')

/* 用户相关的路由处理. */
router.get('/kkb', async function(req, res, next) {
  const {role_name} = req.query
  const res_ = await roleService.calcaulatePermission(role_name)
  console.log(res_)
  res.send({var: res_});
});

module.exports = router;
