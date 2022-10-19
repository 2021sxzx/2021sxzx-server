//========== 为何总要弄一个List出来？为了让前端更新列表数据更加方便 ============//

const {
  addUser,
  getUserList,
  updateUser,
  deleteUser,
  searchUser,
  getActivation,
  setActivation,
  batchImportedUser
} = require('../service/userManagementService')
const unitService = require('../service/unitService')

const {SuccessModel, ErrorModel} = require('../utils/resultModel')

// 用于异步函数的筛选，索引式筛选
const asyncFilter = async (array, AsyncCallback) => {
  const tempArr = await Promise.all(array.map(AsyncCallback))
  return array.filter((_v, index) => {
    return tempArr[index]
  })
}

// 全新的用户列表，用于访问控制渲染使用，只需要传入用户列表参数和unit_id即可
async function newUserList(res, unit_id) {
  try {
    return await asyncFilter(res, async item => {
      return await unitService.calculateWhoIsParent(unit_id, item.unit_id)
    })
  } catch (error) {
    return new ErrorModel({msg: e.message})
  }
}

/**
 * 用来添加一个用户，然后返回添加后的用户列表
 * @param userInfo  用户信息对象，有[user_name][account][password][role_name]
 * @param unit_id
 * @return {Promise<SuccessModel | ErrorModel>}
 */
async function addUserAndReturnList(userInfo, unit_id) {
  try {
    await addUser(userInfo)
    const result = await getUserList()
    const res = await newUserList(result, unit_id)
    return new SuccessModel({
      msg: '添加成功',
      data: res
    })
  } catch (e) {
    return new ErrorModel({msg: e.message})
  }
}

/**
 * 批量添加用户
 */
async function addUserBatchingAndReturnList(imported_array, unit_id) {
  try {
    if (await batchImportedUser(imported_array) === 'role failed') return new SuccessModel({msg: '添加失败，存在不可用的角色'})
    const result = await getUserList()
    const res = await newUserList(result, unit_id)
    return new SuccessModel({
      msg: '添加成功',
      data: res
    })
  } catch (error) {
    return new ErrorModel({msg: error.message})
  }
}

/**
 * 用于返回一个变化后的全体列表
 * @return {Promise<SuccessModel | ErrorModel>}
 */
async function returnUserList(unit_id) {
  try {
    const result = await getUserList()
    // console.log("result", unit_id);
    const res = await newUserList(result, unit_id)
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
 * @param role_id
 * @param account   用户账户
 * @param new_account
 * @param unit_id
 * @param my_unit_id
 * @return {Promise<SuccessModel | ErrorModel>}
 */
async function updateUserAndReturnList(user_name, password, role_id, account, new_account, unit_id, my_unit_id) {
  try {
    await updateUser(user_name, password, role_id, account, new_account, unit_id)
    const result = await getUserList()
    const res = await newUserList(result, my_unit_id)
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
 *  @param unit_id
 *  @return {Promise<SuccessModel | ErrorModel>}
 */
async function deleteUserAndReturnList(account, unit_id) {
  try {
    if (await deleteUser(account)) {
      const result = await getUserList()
      const res = await newUserList(result, unit_id)
      return new SuccessModel({
        msg: 0,
        data: res
      })
    } else return new SuccessModel({
      msg: 1
    })
  } catch (e) {
    return new ErrorModel({msg: e.message})
  }
}

/**
 * @param searchValue
 * @param unit_id
 */
async function searchUserAndReturnList(searchValue, unit_id) {
  try {
    let res = await searchUser(searchValue)

    const result = await asyncFilter(res, async item => {
      return await unitService.calculateWhoIsParent(unit_id, item.unit_id)
    })

    return new SuccessModel({
      msg: '查询成功',
      data: result
    })
  } catch (e) {
    throw new ErrorModel({msg: e.message})
  }
}

async function getActivationAndReturn(account) {
  try {
    let res = await getActivation(account)
    return new SuccessModel({
      msg: '成功获取状态',
      data: res
    })
  } catch (e) {
    throw new ErrorModel({msg: e.message})
  }
}

async function setActivationAndReturn(account, unit_id) {
  try {
    await setActivation(account)
    const result = await getUserList()
    const res = await newUserList(result, unit_id)
    return new SuccessModel({
      msg: '改变激活状态成功',
      data: res
    })
  } catch (e) {
    throw new ErrorModel({msg: e.message})
  }
}

module.exports = {
  addUserAndReturnList,
  addUserBatchingAndReturnList,
  returnUserList,
  updateUserAndReturnList,
  deleteUserAndReturnList,
  searchUserAndReturnList,
  getActivationAndReturn,
  setActivationAndReturn
}
