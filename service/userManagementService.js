const users = require('../model/users')
const roleMapPermission = require('../model/roleMapPermission')

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
    let res = await users.find({}, {
      user_name: 1,
      password: 1,
      role_name: 1,
      account: 1,

    })
    return res
  } catch (e) {
    throw e.message 
  }
}

/**
 * 更新用户数据，也包含更新角色
 * @param user_name
 * @param password
 * @param role_name
 * @param account
 * @param new_account
 * @return {Promise<>}
 */
async function updateUser (user_name, password, role_name, account, new_account) {
  try {
    let res = await users.updateOne({
      account: account
    }, {
      user_name: user_name,
      password: password,
      role_name: role_name,
      account: new_account,
      activation_status: 1
    })
    return res
  } catch (e) {
    throw e.message
  }
}

/**
 * 删除角色
 * @param {*} account 
 * @returns 
 */
async function deleteUser (account) {
  try {
    let res = await users.deleteOne({
      account
    })
    return res
  } catch (e) {
    throw e.message
  }
}

/**
 * 修改角色
 * @param {*} searchValue 
 * @returns 
 */
// TODO (钟卓江=>林凯迪):原型上是对每个属性值分别查，不是混在一起查
async function searchUser (searchValue) {
  const reg = new RegExp(searchValue, 'i')
  try {
    let res = await users.find({
      $or: [
        {
          user_name: { $regex : reg }
        },{
          account: { $regex : reg }
        }
      ]
    }, {
      user_name: 1,
      password: 1,
      role_name: 1,
      account: 1,
      activation_status: 1
    })
    return res
  } catch (e) {
    throw e.message
  }
}

async function isActivation (account) {
  try {
    let res = await users.findOne({
      account
    }, {
      activation_status: 1
    })
    return res;
  } catch {
    throw e.message
  }
}

async function setActivation (account) {
  try {
    let res = await users.findOne({
      account
    }, {
      account: 1,
      activation_status: 1
    })
    let tmp = res.activation_status === 1 ? 0 : 1;
    console.log(tmp);
    await users.updateOne({
      account
    }, {
      activation_status: tmp
    });
    res = await users.findOne({
      account
    }, {
      account: 1,
      activation_status: 1
    })
    
    return res
  } catch (e) {
    throw e.message
  }
}

module.exports = {
  addUser,
  getUserList,
  updateUser,
  deleteUser,
  searchUser,
  isActivation,
  setActivation
}