const express = require('express');
const path = require('path')
const fs = require('fs')
const router = express.Router();
const {
    getMongoBackupCycleController,
    changeBackupCycleController,
    getMongoBackupController,
    createSystemBackupController
  } = require("../controller/systemBackupController.js");
const systemBackup = require('../model/systemBackup.js');

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

/**
 * 删除一个备份
 */
 router.post('/v1/delete-system-backup', async (req, res, next) => {
  // console.log("first")
  let data=req.body;
  // console.log(data);
  var backupPath=path.join('/www/backup/mongodb_bak/mongodb_bak_list',data.backup_name)
  fs.unlink(backupPath, function(err){
    if(err)throw err;
    console.log('删除成功')
  })   
  systemBackup.deleteOne({'_id':data._id}).then((res) =>{
    console.log('备份删除成功')
  })
  res.end()
  // setStatusCode(res, result)
  // res.json(result)
})

module.exports = router;
