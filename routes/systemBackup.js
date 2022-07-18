const express = require('express');
const fs = require('fs')
const router = express.Router();
const {
  getMongoBackupCycleController, changeBackupCycleController, getMongoBackupController, createSystemBackupController
} = require("../controller/systemBackupController.js");
const systemBackup = require('../model/systemBackup.js');

const {
  handleBackup,
} = require("../service/systemBackupService.js");

/* 系统备份相关的路由处理. */
/**
 * 提交系统备份
 */
router.get('/v1/create-system-backup', async (req, res) => {
  // console.log("-----------create-system-failure-------------")
  let data = req.body;
  await createSystemBackupController(data);
  res.end('200');
})
/**
 * 系统备份的获取
 */
router.get('/v1/mongo-backup', async (req, res) => {
  let data = await getMongoBackupController()
//   setStatusCode(res,data)
  res.json(data)
})

/**
 * 获取系统自动备份的周期
 */
router.get('/v1/mongo-backup-cycle', async (req, res) => {
  let data = await getMongoBackupCycleController()
//   setStatusCode(res,data)
  res.json(data)
})

/**
 * 修改系统自动备份的周期
 */
router.post('/v1/change-backup-cycle', async (req, res) => {
  let data = req.body;
  let message = await changeBackupCycleController(data)
  res.json(message)
})

/**
 * 手动备份
 */
router.get('/v1/handle-backup', async (req, res) => {
  await handleBackup(req.headers.userid)
  res.json('data')
})

/**
 * 删除一个备份
 */
router.post('/v1/delete-system-backup', async (req, res) => {
  let data = req.body;
  fs.unlink(data.backup_name, (err) => {
    if (err) console.log(err);
  })
  systemBackup.deleteOne({'_id': data._id}).then();
  res.end();
})

module.exports = router;
