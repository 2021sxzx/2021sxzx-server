//========== 为何总要弄一个List出来？为了让前端更新列表数据更加方便 ============//

const {
  addUser,
  getUserList,
  updateUser,
  deleteUser,
  searchUser,
  isActivation,
  setActivation
} = require('../service/userManagementService')
const userDepartmentService = require('../service/userDepartmentService');

const {SuccessModel, ErrorModel} = require('../utils/resultModel');

/**
 * 用来添加一个用户，然后返回添加后的用户列表
 * @param userInfo  用户信息对象，有[user_name][account][password][role_name]
 * @return {Promise<SuccessModel | ErrorModel>} 
 */
async function addUserAndReturnList (userInfo) {
  try {
    await addUser(userInfo);
    await userDepartmentService.addUserAndDepartmentInitial(userInfo.account, userInfo.user_name, userInfo.department_name);

    const res = await getUserList();
    const res_ = await Promise.all(
      res.map(async (item) => {
        const cal = await userDepartmentService.findDepartmentByAccount(item.account, item.user_name);
        // if (!item['department_name']) {
        //   item['department_name'] = cal;
        // }
        cal = cal === undefined ? '无' : cal;
        return {
          _id: item._id,
          user_name: item.user_name,
          role_name: item.role_name,
          account: item.account,
          password: item.password,
          activation_status: item.activation_status,
          department_name: cal
        }
      })
    )
    return new SuccessModel({
      msg: '添加成功',
      data: res_
    })
  } catch (e) {
    return new ErrorModel({msg: e.message});
  }
}

/**
 * 用于返回一个变化后的全体列表
 * @return {Promise<SuccessModel | ErrorModel>} 
 */
async function returnUserList () {
  try {
    const res = await getUserList();
    const res_ = await Promise.all(
      res.map(async (item) => {
        const cal = await userDepartmentService.findDepartmentByAccount(item.account, item.user_name);
        // if (!item['department_name']) {
        //   item['department_name'] = cal;
        // }
        // cal = cal === undefined ? '无' : cal;
        // console.log(item.department_name)
        return {
          _id: item._id,
          user_name: item.user_name,
          role_name: item.role_name,
          account: item.account,
          password: item.password,
          activation_status: item.activation_status,
          department_name: cal
        }
      })
    )
    return new SuccessModel({
      msg: '获取列表成功',
      data: res_
    })
  } catch (e) {
    return new ErrorModel({msg: e.message})
  }
}

/**
 * 用于返回一个用户经过更新之后的全体用户列表
 * @param user_name 用户名
 * @param password  密码
 * @param role_name 角色名
 * @param account   用户账户
 * @return {Promise<SuccessModel | ErrorModel>}
 */
async function updateUserAndReturnList (user_name, password, role_name, account, new_account) {
  try {
    await updateUser(user_name, password, role_name, account, new_account)
    const res = await getUserList()
    const res_ = await Promise.all(
      res.map(async (item) => {
        const cal = await userDepartmentService.findDepartmentByAccount(item.account, item.user_name);
        if (!item['department_name']) {
          item['department_name'] = cal;
        }
        console.log(item.department_name)
        return {
          _id: item._id,
          user_name: item.user_name,
          role_name: item.role_name,
          account: item.account,
          password: item.password,
          activation_status: item.activation_status,
          department_name: cal
        }
      })
    )
    return new SuccessModel({
      msg: '修改成功',
      data: res_
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
    await deleteUser(account);
    await userDepartmentService.deleteUserAndDepartment(account);
    const res = await getUserList();
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
    const res = await searchUser(searchValue);
    const res_ = await Promise.all(
      res.map(async (item) => {
        const cal = await userDepartmentService.findDepartmentByAccount(item.account, item.user_name);
        return {
          _id: item._id,
          user_name: item.user_name,
          role_name: item.role_name,
          account: item.account,
          password: item.password,
          activation_status: item.activation_status,
          department_name: cal
        }
      })
    )
    return new SuccessModel({
      msg: '查询成功',
      data: res_
    })
  } catch (e) {
    throw new ErrorModel({msg: e.message})
  }
}

async function setActivationAndReturn (account) {
  try {
    const res = await setActivation(account);
    const res_ = await Promise.all(
      res.map(async (item) => {
        const cal = await userDepartmentService.findDepartmentByAccount(item.account, item.user_name);
        return {
          _id: item._id,
          user_name: item.user_name,
          role_name: item.role_name,
          account: item.account,
          password: item.password,
          activation_status: item.activation_status,
          department_name: cal
      }
      })
    )
    return new SuccessModel({
      msg: '改变激活状态成功',
      data: res_
    })
  } catch (e) {
    throw new ErrorModel({msg: e.message});
  }
}

module.exports = {
  addUserAndReturnList,
  returnUserList,
  updateUserAndReturnList,
  deleteUserAndReturnList,
  searchUserAndReturnList,
  setActivationAndReturn
}