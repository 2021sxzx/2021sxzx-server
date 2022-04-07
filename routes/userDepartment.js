const userDepartmentService = require('../service/userDepartmentService');
const express = require('express');
const router = express.Router();

function wrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      throw new ErrorModel({
        msg: "获取侧边栏失败",
        data: e.message
      });
    }
  };
}

router.get('/test2', async (req, res) => {
  const k = await userDepartmentService.updateDepartment("办公室2", "办公室");
  res.json(k);
})

module.exports = router;