const express = require('express');
const router = express.Router();
const {
    getMongoFileController
  } = require("../controller/systemBackupController.js")

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
 router.get('/v1/mongoBackup', async (req,res,next) => {
  let data = await getMongoFileController()
//   setStatusCode(res,data)
  res.json('data')
})


module.exports = router;
