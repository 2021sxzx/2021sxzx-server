//========== 为何总要弄一个List出来？为了让前端更新列表数据更加方便 ============//

const {
  addUser,
  getUserList,
  updateUser,
  deleteUser,
  searchUser
} = require('../service/userManagementService')

const {SuccessModel, ErrorModel} = require('../utils/resultModel');

/**
 * 用来添加一个用户，然后返回添加后的用户列表
 * @param userInfo  用户信息对象，有[user_name][account][password][role_name]
 * @return {Promise<SuccessModel | ErrorModel>} 
 */
async function addUserAndReturnList (userInfo) {
  try {
    await addUser(userInfo)
    const res = await getUserList()
    return new SuccessModel({
      msg: '添加成功',
      data: res
    })
  } catch (e) {
    return new ErrorModel({msg: e.message})
  }
}

/**
 * 用于返回一个变化后的全体列表
 * @return {Promise<SuccessModel | ErrorModel>} 
 */
async function returnUserList () {
  try {
    const res = await getUserList()
    return new SuccessModel({
      msg: '获取列表成功',
      data: res
    })
  } catch (e) {
    return new ErrorModel({msg: e.message})
  }
}

/**
 * 用于返回一个用户经过更新之后的全体用户列表
 * @param user_name 用户名
 * @param password  密码
 * @param account   用户账户
 * @return {Promise<SuccessModel | ErrorModel>}
 */
async function updateUserAndReturnList (user_name, password, account) {
  try {
    await updateUser(user_name, password, account)
    const res = await getUserList()
    return new SuccessModel({
      msg: '修改成功',
      data: res
    })
  } catch (e) {
    return new ErrorModel({msg: e.message})
  }
}

/**
 *  用于返回一个用户经过被删除之后的全体用户列表
 *  @param account  用户账户
 *  @return {Promise<SuccessModel | ErrorModel>}
 */
async function deleteUserAndReturnList (account) {
  try {
    await deleteUser(account)
    const res = await getUserList()
    return new SuccessModel({
      msg: '删除成功',
      data: res
    })
  } catch (e) {
    return new ErrorModel({msg: e.message})
  }
}

/**
 * @param searchValue 
 */
async function searchUserAndReturnList (searchValue) {
  try {
    await searchUser(searchValue)
    const res = await getUserList()
    return new SuccessModel({
      msg: '查询成功',
      data: res
    })
  } catch (e) {
    return new ErrorModel({msg: e.message})
  }
}

module.exports = {
  addUserAndReturnList,
  returnUserList,
  updateUserAndReturnList,
  deleteUserAndReturnList,
  searchUserAndReturnList
}