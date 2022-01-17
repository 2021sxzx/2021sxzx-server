const users = require('../model/users')

/**
 * 添加后台用户
 * @param userInfo  对话框获取的信息
 * @return {Promise<*>} 返回一个
 */
async function addUser (userInfo) {
  try {
    let res = await users.create(userinfo)
    return res
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 * 获取用户列表
 * @return {Promise<*>}
 */
async function getUserList () {
  try {
    let res = await users.find({}, {
      idc: 0,
      profile_picture: 0,
      user_name: 1,
      role_name: 1,
      account: 1,
      activation_status: 1
    })
    return res
  } catch (e) {
    throw new Error(e.message)
  }
}

module.exports = {
  addUser,
  getUserList
}