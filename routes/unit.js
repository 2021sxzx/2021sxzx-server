const express = require('express');
const router = express.Router();
const unitController = require('../controller/unitController');
const {ErrorModel} = require('../utils/resultModel');

function wrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      throw new ErrorModel({
        msg: "单位信息处理失败",
        data: e.message
      });
    }
  };
}

router.get('/v1/unit', wrap(unitController.getUnit));
router.post('/v1/unit', wrap(unitController.addUnit));
router.delete('/v1/unit', wrap(unitController.deleteUnit));
router.patch('/v1/unit', wrap(unitController.updateUnit));
router.post('/v1/searchUnit', wrap(unitController.searchUnit));
// router.get('/v1/lookupUnit', wrap(unitController.lookupUnit));

module.exports = router;