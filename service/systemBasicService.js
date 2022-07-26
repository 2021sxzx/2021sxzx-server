const systemBasic = require('../model/systemBasic')

/**
 * 设置咨询电话
 * @param newTel
 * @return {Promise<boolean|*>}
 */
async function setTel(newTel) {
  try {
    console.log(newTel) // todo
    console.log(await systemBasic.updateOne({}, {tel: newTel}))
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

module.exports = {setTel, getTel}