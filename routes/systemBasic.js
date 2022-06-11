const express = require('express');
const router = express.Router();
const stmRecommender = require("../model/stmRecommender");
// const {
//     getAllSystemLogDetail,
//     getSearchSystemLog,
//     showSystemLogController,
//     getSystemLog2,
//     getItemBrowseCount,
//     getAdvancedSearchSystemLog
//   } = require("../controller/systemLogController")

function setStatusCode(res,data) {
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
}

/* 系统日志相关的路由处理. */

/**
 * 推荐词的获取
 */
 router.get('/v1/getRecommender', async (req,res,next) => {
//   let data = await showSystemLogController()
//   setStatusCode(res,data)
    let data = await stmRecommender.find();
    res.json(data)
})

module.exports = router;
