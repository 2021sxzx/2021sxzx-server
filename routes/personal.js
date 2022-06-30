const express = require('express');
const router = express.Router();
const personalController = require('../controller/personalController');
const {ErrorModel} = require('../utils/resultModel');

function wrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      throw new ErrorModel({
        msg: "个人信息处理失败",
        data: e.message
      });
    }
  };
}

router.get('/v1/personal', wrap(personalController.getTopBarData));

module.exports = router;