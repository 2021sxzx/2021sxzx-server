const express = require('express')
const router = express.Router()
const permissionController = require('../controller/permissionController');
const { ErrorModel } = require('../utils/resultModel');

function wrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      throw ErrorModel({
        msg: "权限相关操作失败",
        data: e.message
      });
    }
  };
}

router.get('/v1/aboutPermission', wrap(permissionController.searchPermission));
router.post('/v1/aboutPermission', wrap(permissionController.addPermissionAndReturn));
router.patch('/v1/aboutPermission', wrap(permissionController.patchPermission));
router.delete('/v1/aboutPermission', wrap(permissionController.deletePermissionAndReturn));


module.exports = router;