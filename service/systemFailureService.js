const systemFailure = require("../model/systemFailure");
const fs = require('fs');
const { db } = require("../model/systemFailure");
/**
 * 返回全部系统故障记录的接口
 * @returns {Promise<*|*>}
 */
 async function getAllFailure() {
  try {
    let res = await systemFailure.find();
    return res;
  } catch (e) {
    return e.message;
  }
}

/**
 * 创建一个故障
 * @param {string} failure_des
 * @param {string} failure_time
 * @param {string} failure_name
 * @param {string} idc
 * @returns 
 */
 async function createSystemFailure(data) {
  try {
      if (data.failureName === null) {
          throw new Error('call createSystemFailure error: failure_name is null')
      }
      var res = await systemFailure.create({
        failure_time: data.create_time,
        failure_des: data.failureDescription,
        failure_name: data.failureName,
        user_name: data.user_name,
        failure_picture:data.pictureList
      })
      console.log('success')
      console.log(res)
  } catch (err) {
      throw new Error(err.message)
  }
}


module.exports = {
  getAllFailure,
  createSystemFailure
};
