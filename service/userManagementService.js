const users = require('../model/users');
const {
  getRole
} = require('../service/roleService');

/**
 * 添加后台用户
 * @param userInfo  对话框获取的信息
 * @return {Promise<*>} 返回一个
 */
async function addUser (userInfo) {
  try {
    const res = await users.find({account: userInfo.account});
    if (!res) {
      console.log("res", res);
      return;
    }
    const resq = await users.create({
      ...userInfo,
      activation_status: 1,
    });
    return resq;
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
    const res = await users.find({}, {
      _id: 1,
      user_name: 1,
      password: 1,
      role_id: 1,
      account: 1,
      activation_status: 1,
      unit_id: 1,
      department_id: 1
    });
    return res;
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
async function updateUser (user_name, password, role_id, account, new_account) {
  try {
    return await users.updateOne({
      account: account
    }, {
      user_name: user_name,
      password: password,
      role_id: role_id,
      account: new_account
    })
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
    return await users.deleteOne({
      account
    })
  } catch (e) {
    throw e.message
  }
}

/**
 * 查找角色
 * @param {*} searchValue
 * @returns
 */
// TODO (钟卓江=>林凯迪):原型上是对每个属性值分别查，不是混在一起查
async function searchUser (searchValue) {
  const reg = new RegExp(searchValue, 'i')
  try {
    return await users.find({
      $or: [
        {
          user_name: {$regex: reg}
        }, {
          account: {$regex: reg}
        }
      ]
    }, {
      _id: 1,
      user_name: 1,
      password: 1,
      role_id: 1,
      account: 1,
      activation_status: 1,
      unit_id: 1,
      department_id: 1
    })
  } catch (e) {
    throw e.message
  }
}

async function isActivation (account) {
  try {
    return await users.findOne({
      account
    }, {
      activation_status: 1
    });
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
    await users.updateOne({
      account
    }, {
      activation_status: tmp
    });
    let resq = await users.findOne({
      account
    }, {
      _id: 1,
      account: 1,
      activation_status: 1
    })

    return resq;
  } catch (e) {
    throw e.message
  }
}
// 还有个部门id没加
async function batchImportedUser (imported_array) {
  try {
    let mapArray = imported_array.map(item => {
      return {
        user_name: item.user_name,
        role_id: item.role_id,
        department_id: item.department_id,
        account: item.account,
        password: item.password,
        activation_status: 1,
        user_rank: 0,
      }
    })
    let res = await users.insertMany(mapArray, (err) => { console.log(err) });
    return res;
  } catch {
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
  setActivation,
  batchImportedUser
}
