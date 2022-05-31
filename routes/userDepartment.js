const express = require('express');
const router = express.Router();
const userDepartmentController = require('../controller/userDepartmentController');
const { ErrorModel } = require('../utils/resultModel');

function wrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      throw new ErrorModel({
        msg: "操作失败",
        data: e.message
      });
    }
  };
}
// 可行
router.all('*', (req, res, next) => {
  // 配置响应头
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1');
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "SameOrigin");
  if(req.method=="OPTIONS") res.sendStatus(200);/*让options请求快速返回*/
  else  next();
})
router.post('/v1/Department', wrap(userDepartmentController.addDepartmentCallback));
router.delete('/v1/Department', wrap(userDepartmentController.deleteDepartmentCallback));
router.patch('/v1/Department', wrap(userDepartmentController.updateDepartmentCallback));
router.get('/v1/Department', wrap(userDepartmentController.listAllDepartmentCallback));
router.post('/v1/searchDepartment', wrap(userDepartmentController.searchDepartmentCallback));
router.delete('/v1/PeopleDepartment', wrap(userDepartmentController.deletePeopleDepartmentCallback));

module.exports = router;