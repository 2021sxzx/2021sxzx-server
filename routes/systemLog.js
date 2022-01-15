const express = require('express');
const router = express.Router();
const {
    getAllSystemLogDetail,
    getSearchSystemLog
  } = require("../controller/systemLogController")
  
function setStatusCode(res,data) {
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
}

/* 系统日志相关的路由处理. */

/**
 * 系统日志的获取
 */
router.get('/v1/log', async (req,res,next) => {
  let data = await getAllSystemLogDetail()
  setStatusCode(res,data)
  res.json(data)
})

/**
 * 搜索功能
 */
router.post('/v1/searchLog',async (req,res,next) => {
  let searchData = req.body
  let data = await getSearchSystemLog(searchData)
  setStatusCode(res,data)
  res.json(data)
})


module.exports = router;
