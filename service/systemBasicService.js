const systemBasic = require('../model/systemBasic')
const redisClient = require('../config/redis')

/**
 * 设置咨询电话
 * @param newTel
 * @return {Promise<boolean|*>}
 */
async function setTel(newTel) {
  try {
    await systemBasic.updateOne({}, {tel: newTel})
    return true
  } catch (e) {
    return e.message
  }
}

/**
 * 获取咨询电话
 * @return {Promise<*>}
 */
async function getTel() {
  /** @property data.tel */
  try {
    const data = await systemBasic.findOne({})
    return data.tel
  } catch (e) {
    return e.message
  }
}

/**
 * 获取热词
 * @return {Promise<Array<ConvertArgumentType<string | Buffer, string>>|*>}
 */
async function getHotKeys() {
  try {
    return await redisClient.zRange('hotEvents', 0, 9, {REV: true})
  } catch (e) {
    return e.message
  }
}

/**
 * 删除指定热词
 * @param hotKey
 * @return {Promise<boolean|*>}
 */
async function deleteHotKey(hotKey) {
  try {
    await redisClient.zRem('hotEvents', hotKey)
    return true
  } catch (e) {
    return e.message
  }
}

/**
 * 添加指定热词
 * @param hotKey
 * @return {Promise<boolean|*>}
 */
async function addHotKey(hotKey) {
  try {
    await redisClient.zAdd('hotEvents', {score: 4294967295, value: hotKey})
    return true
  } catch (e) {
    return e.message
  }
}

module.exports = {setTel, getTel, getHotKeys, deleteHotKey, addHotKey}