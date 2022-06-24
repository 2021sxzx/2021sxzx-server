const express = require('express');
const router = express.Router();
const systemMetaController = require('../controller/systemMetaController');

const { ErrorModel } = require('../utils/resultModel');

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

router.get('/v1/interface', wrap(systemMetaController.getNetworkStatus));
router.patch('/v1/interface', wrap(systemMetaController.patchNetworkStatus));
router.get('/v1/peopleStatus', wrap(systemMetaController.getUserOnlineNumberAndMaxOnlineNumber));

module.exports = router;