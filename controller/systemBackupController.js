// const systemFailure = require("../model/systemFailure");
const {
    getMongoBackupCycle,
    changeBackupCycleService,
    getSystemBackup,
    createSystemBackup
} = require("../service/systemBackupService.js")
const {SuccessModel, ErrorModel} = require('../utils/resultModel');

/**
 * 查看系统备份列表
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
 async function getMongoBackupController() {
  try {
    let data = await getSystemBackup();
    return new SuccessModel({msg: '获取系统备份成功', data:data});
  } catch (e) {
    return new ErrorModel({msg:e.message})
  }
}
/**
  * 提交一个系统备份记录
  * @param {string} failure_des
  * @returns {Promise<ErrorModel|SuccessModel>}
  */
async function createSystemBackupController(data) {
      try {
        await createSystemBackup(data);
        return new SuccessModel({msg: '获取系统故障成功',data:'success'});
      } catch (e) {
        return new ErrorModel({msg:e.message})
      }
}

/**
 * 查看系统备份周期
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
 async function getMongoBackupCycleController() {
  try {
    let data = await getMongoBackupCycle();
    return new SuccessModel({msg: '获取系统备份周期成功', data:data});
  } catch (e) {
    return new ErrorModel({msg:e.message})
  }
}

/**
 * 修改系统备份周期
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
async function changeBackupCycleController(data) {
    try {
        let message=await changeBackupCycleService(data);
        return new SuccessModel({msg: '修改系统备份周期成功', data:message});
    } catch (e) {
        return new ErrorModel({msg:e.message})
    }
}

  module.exports = {
    getMongoBackupCycleController,
    changeBackupCycleController,
    getMongoBackupController,
    createSystemBackupController
  }