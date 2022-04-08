const express = require('express');
const router = express.Router();
const userDepartmentController = require('../controller/userDepartmentController');

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

router.post('/v1/Department', wrap(userDepartmentController.addDepartmentCallback));
router.delete('/v1/Department', wrap(userDepartmentController.deleteDepartmentCallback));
router.patch('/v1/Department', wrap(userDepartmentController.updateDepartmentCallback));
router.get('/v1/Department', wrap(userDepartmentController.listAllDepartmentCallback));
router.get('/v1/searchDepartment', wrap(userDepartmentController.searchDepartmentCallback));

module.exports = router;