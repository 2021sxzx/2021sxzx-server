const express = require('express');
const router = express.Router();

const sideBarController = require('../controller/sideBarController');
const { ErrorModel } = require('../utils/resultModel');

function wrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      return ErrorModel({
        msg: "获取侧边栏失败",
        data: e.message
      });
    }
  };
}

router.post('/sideBar', wrap(sideBarController.sideBarList));

module.exports = router;