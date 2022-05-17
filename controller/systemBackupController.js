// const systemFailure = require("../model/systemFailure");
const {
  getMongoBackupCycle,
    changeBackupCycleService
} = require("../service/systemBackupService.js")
const {SuccessModel, ErrorModel} = require('../utils/resultModel');

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
      changeBackupCycleController
  }