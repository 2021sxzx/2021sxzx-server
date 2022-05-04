const {
    getCpuPercentage,
    getMemory,
    getDisk,
    viewProcessMessage
  } = require("../service/systemResourceService")
  const {SuccessModel, ErrorModel} = require('../utils/resultModel');

  /**
   * 查看cpu占用率
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
   async function getCpuPercentageController() {
    try {
      let data = await getCpuPercentage();
      // return data;
      return new SuccessModel({msg: '获取cpu占用率成功', data:data});
    } catch (e) {
      return new ErrorModel({msg:e.message})
    }
  }

    /**
   * 查看内存信息
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
     async function getMemoryController() {
      try {
        let data = await getMemory();
        return new SuccessModel({msg: '获取内存信息成功', data:data});
      } catch (e) {
        return new ErrorModel({msg:e.message})
      }
    }

   /**
   * 查看磁盘信息
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
     async function getDiskController() {
      try {
        let data = await getDisk();
        return new SuccessModel({msg: '获取磁盘信息成功', data:data});
      } catch (e) {
        return new ErrorModel({msg:e.message})
      }
    }

  /**
   * 查看磁盘信息
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
        async function viewProcessMessageController() {
          try {
            let data = await viewProcessMessage();
            console.log('data:',data)
            return new SuccessModel({msg: '获取进程信息成功', data:data});
          } catch (e) {
            return new ErrorModel({msg:e.message})
          }
        }
    
  module.exports = {
    getCpuPercentageController,
    getMemoryController,
    getDiskController,
    viewProcessMessageController
  }
