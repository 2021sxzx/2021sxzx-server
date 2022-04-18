const express = require('express');
const router = express.Router();
const {
    getAllSystemLogDetail,
    getSearchSystemLog,
    showSystemLogController
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
 * show系统日志的获取
 */
 router.get('/v1/show', async (req,res,next) => {
  let data = await showSystemLogController()
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

router.get('/v1/test',async (req,res,next) => {
    let d = new Date().toJSON().substring(0,10);
    setStatusCode(res,d)
    res.json(d)
})


module.exports = router;
