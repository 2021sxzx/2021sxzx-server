const express = require('express');
const router = express.Router();
const {
    getMongoBackupCycleController,
    changeBackupCycleController,
    getMongoBackupController,
    createSystemBackupController
  } = require("../controller/systemBackupController.js")

const {
  handleBackup,
} = require("../service/systemBackupService.js");
  
function setStatusCode(res,data) {
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
}

/* 系统备份相关的路由处理. */
/**
 * 提交系统备份
 */
router.get('/v1/create-system-backup', async (req, res, next) => {
  // console.log("-----------create-system-failure-------------")
  let data=req.body;
  await createSystemBackupController(data);
  res.end('200');
})
/**
 * 系统故障的获取
 */
 router.get('/v1/mongo-backup', async (req,res,next) => {
  let data = await getMongoBackupController()
//   setStatusCode(res,data)
  res.json(data)
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

/**
 * 手动备份
 */
 router.get('/v1/handle-backup', async (req,res,next) => {
     // console.log('++++++');
     // console.log(req.headers.userid);
  await handleBackup(req.headers.userid)
  // let data=await handleBackup()
//   setStatusCode(res,data)
  res.json('data')
})

module.exports = router;
