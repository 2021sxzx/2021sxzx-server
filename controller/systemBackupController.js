// const systemFailure = require("../model/systemFailure");
const {
    getMongoFile
} = require("../service/systemBackupService.js")
const {SuccessModel, ErrorModel} = require('../utils/resultModel');

  /**
   * 查看系统故障
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
   async function getMongoFileController() {
    try {
      let data = await getMongoFile();
      return new SuccessModel({msg: '获取系统故障成功', data:data});
    } catch (e) {
      return new ErrorModel({msg:e.message})
    }
  }

  module.exports = {
    getMongoFileController
  }