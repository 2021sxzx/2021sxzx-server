const express = require('express');
const router = express.Router();
const {
    getAllSystemLogDetail,
    getSearchSystemLog,
    showSystemLogController,
    getSystemLog2,
    getItemBrowseCount,
    getAdvancedSearchSystemLog
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

/**
 * 高级搜索功能
 */
 router.post('/v1/advancedSearchLog',async (req,res,next) => {
  let searchData = req.body
  let data = await getAdvancedSearchSystemLog(searchData)
  setStatusCode(res,data)
  res.json(data);
})

router.get('/v1/metaDataLog',async (req,res,next) => {
    let data = await getSystemLog2()
    setStatusCode(res,data)
    res.json(data.data)
})

router.get('/v1/itemBrowseCount',async (req,res,next) => {
  let data = await getItemBrowseCount()
  setStatusCode(res,data)
  res.json(data.data)
})


module.exports = router;
