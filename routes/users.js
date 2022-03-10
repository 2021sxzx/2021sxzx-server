const express = require('express');
const router = express.Router();
const roleService = require('../service/roleService')
const roleController = require('../controller/roleController')

/**
 * 测试一下接口相关的函数有没有问题
 */
router.post('/test', async function (req, res, next) {
  const {
    role_name,
    role_describe
  } = req.body
  const permission = [0, 1, 2]
  const res_ = await roleController.returnRoleList()

  res.send({var: res_});
});

module.exports = router;
