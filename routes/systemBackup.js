const express = require('express');
const router = express.Router();
const {
  getMongoBackupCycleController,
    changeBackupCycleController
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

/**
 * 获取系统自动备份的周期
 */
 router.get('/v1/mongo-backup-cycle', async (req,res,next) => {
  let data = await getMongoBackupCycleController()
//   setStatusCode(res,data)
  res.json(data)
})

/**
 * 修改系统自动备份的周期
 */
router.post('/v1/change-backup-cycle', async (req,res,next) => {
    let data = req.body;
    // console.log(data);
    let message=await changeBackupCycleController(data)
//   setStatusCode(res,data)
    res.json(message)
})


module.exports = router;
