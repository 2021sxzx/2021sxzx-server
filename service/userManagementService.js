const users = require('../model/users')

/**
 * 添加后台用户
 * @param userInfo  对话框获取的信息
 * @return {Promise<*>} 返回一个
 */
async function addUser (userInfo) {
  try {
    let res = await users.create(userInfo)
    return res
  } catch (e) {
    throw e.message
  }
}

/**
 * 获取用户列表
 * @return {Promise<*>}
 */
async function getUserList () {
  try {
    let res = await users.find({}, {activation_status: 0, idc: 0})
    console.log(res)
    return res
  } catch (e) {
    throw e.message 
  }
}

/**
 * 更新用户数据
 * @param user_name
 * @param password
 * @return {Promise<>}
 */
async function updateUser (user_name, password) {
  try {
    let res = await users.updateOne({
      user_name: user_name,
      password: password
    })
    return res
  } catch (e) {
    throw e.message
  }
}

async function deleteUser (account) {
  try {
    let res = await users.deleteOne({
      account: account
    })
    return res
  } catch (e) {
    throw e.message
  } 
}

async function searchUser (searchValue) {
  const reg = new RegExp(searchValue, 'i')
  try {
    let res = await users.find({
      $or: [
        {
          user_name: { $regex : reg }
        },{
          account: { $regex : reg }
        },{
          password: { $regex : reg }
        }
      ]
    })
    return res
  } catch (e) {
    throw e.message
  }
}

async function searchUserRole (RoleArr) {
  try {
    let res = await users.findOne({
      role_name: RoleArr
    })
  } catch (e) {
    throw e.message
  }
}

module.exports = {
  addUser,
  getUserList,
  updateUser,
  deleteUser,
  searchUser
}