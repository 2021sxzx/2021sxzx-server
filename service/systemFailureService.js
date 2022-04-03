const systemFailure = require("../model/systemFailure");
const fs = require('fs')
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
 async function createSystemFailure({failure_time,failure_des,failure_name,idc}) {
  try {
      if (failure_name === null) {
          throw new Error('call createSystemFailure error: failure_name is null')
      }
      var res = await systemFailure.create({
        failure_time: failure_time,
        failure_des: failure_des,
        failure_name: failure_name,
        idc: idc
      })
      return res
  } catch (err) {
      throw new Error(err.message)
  }
}


module.exports = {
  getAllFailure,
  createSystemFailure
};
