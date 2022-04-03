const {
    getAllFailure,
    createSystemFailure
} = require("../service/systemFailureService")
const {SuccessModel, ErrorModel} = require('../utils/resultModel');

  /**
   * 查看系统故障
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
   async function showSystemFailureController() {
    try {
      let data = await getAllFailure();
      return new SuccessModel({msg: '获取系统故障成功', data:data});
    } catch (e) {
      return new ErrorModel({msg:e.message})
    }
  }

    /**
   * 提交一个系统故障
   * @param {string} failure_des
   * @param {string} failure_time
   * @param {string} failure_name
   * @param {string} idc
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
     async function createSystemFailureController(failure_time,failure_des,failure_name,idc) {
      try {
        await itemService.createItemRule({
          failure_time,failure_des,failure_name,idc
      })
      return new SuccessModel({msg: '获取系统故障成功',});
      } catch (e) {
        return new ErrorModel({msg:e.message})
      }
    }

  module.exports = {
    showSystemFailureController,
    createSystemFailureController
  }