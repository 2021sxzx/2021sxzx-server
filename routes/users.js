const express = require('express');
const router = express.Router();
const roleService = require('../service/roleService')

/* 用户相关的路由处理. */
router.get('/kkb', async function(req, res, next) {
  const {
    role_name, 
    role_describe, 
    permission_identifier_array
  } = req.body
  
  const res_ = 
    await roleService.addRole(
      role_name, role_describe, permission_identifier_array
    )

  res.send({var: res_});
});

module.exports = router;