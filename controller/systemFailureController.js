const systemFailure = require("../model/systemFailure");
const {
    getAllFailure,
    createSystemFailure
} = require("../service/systemFailureService")
const {
  createImage
} = require("../service/imageService")
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
     async function createSystemFailureController(data) {
      try {
        //对图片存入数据库之前处理一下
        // console.log('222222222222')
        // console.log(data.failurePicture.fileList)
        // console.log(data.fileSizeList.length)
        // console.log(data.fileSizeList===[])
        if(data.fileSizeList.length){
          // console.log('inside')
          for (let i = 0; i < data.failurePicture.fileList.length; i++) {
            data.pictureList[i].size = data.fileSizeList[i]
            data.pictureList[i].location = "系统故障上传的图片"
          }
          data.pictureList.forEach(item=>{
            // console.log('**********************')
            // console.log(item)
            // console.log('**********************')
            createImage(item)
          })
        }
        // console.log(data.failurePicture.fileL)
        // console.log('data')
        // console.log(data)
        await createSystemFailure(data);
        return new SuccessModel({msg: '获取系统故障成功',data:'success'});
      } catch (e) {
        return new ErrorModel({msg:e.message})
      }
    }

  module.exports = {
    showSystemFailureController,
    createSystemFailureController
  }