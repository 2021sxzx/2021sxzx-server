const express = require('express');
const router = express.Router();
const {
    getCpuPercentageController,
    getMemoryController,
    getDiskController,
    viewProcessMessageController
  } = require("../controller/systemResourceController")

function setStatusCode(res,data) {
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
}

/* 资源管理相关的路由处理. */

/**
 * 获取cpu占用率
 */
 router.get('/v1/showCpuPercentage', async (req,res,next) => {
    let data = await getCpuPercentageController()
    // data="type:"+Object.prototype.toString.call(data)
    setStatusCode(res,data)
    res.json(data)
    // res.json(Object.prototype.toString.call(data))
  })

/**
 * 获取内存占用率
 */
 router.get('/v1/showMemory', async (req,res,next) => {
  let data = await getMemoryController()
  // data="type:"+Object.prototype.toString.call(data)
  setStatusCode(res,data)
  res.json(data)
  // res.json(Object.prototype.toString.call(data))
})

/**
 * 获取磁盘占用率
 */
 router.get('/v1/showDisk', async (req,res,next) => {
  let data = await getDiskController()
  // data="type:"+Object.prototype.toString.call(data)
  setStatusCode(res,data)
  res.json(data)
  // res.json(Object.prototype.toString.call(data))
})

/**
 * 获取进程数
 */
 router.get('/v1/viewProcessMessage', async (req,res,next) => {
  let data = await viewProcessMessageController()
  // data="type:"+Object.prototype.toString.call(data)
  setStatusCode(res,data)
  // res.send(data)
  res.json(data.data)
  // res.json(Object.prototype.toString.call(data))
})

module.exports = router;
