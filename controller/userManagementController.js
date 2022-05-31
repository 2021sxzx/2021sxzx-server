//========== 为何总要弄一个List出来？为了让前端更新列表数据更加方便 ============//

const {
  addUser,
  getUserList,
  updateUser,
  deleteUser,
  searchUser,
  isActivation,
  setActivation,
  batchImportedUser
} = require('../service/userManagementService');
const unitService = require('../service/unitService');
const userDepartmentService = require('../service/userDepartmentService');
const {
  getRole
} = require('../service/roleService');

const {SuccessModel, ErrorModel} = require('../utils/resultModel');

/**
 * 用来添加一个用户，然后返回添加后的用户列表
 * @param userInfo  用户信息对象，有[user_name][account][password][role_name]
 * @return {Promise<SuccessModel | ErrorModel>} 
 */
async function addUserAndReturnList (userInfo) {
  try {
    await addUser(userInfo);
    // await userDepartmentService.addUserAndDepartmentInitial(userInfo.account, userInfo.user_name, userInfo.department_name);

    const res = await getUserList();
    const res_ = await Promise.all(
      res.map(async (item) => {
        const cal = await unitService.lookupUnit(item.unit_id);
        const calRoleObj = await getRole(item._doc.role_id);
        return {
          _id: item._id,
          user_name: item.user_name,
          role_name: calRoleObj.role_name,
          account: item.account,
          password: item.password,
          activation_status: item.activation_status,
          unit_name: cal,
          unit_id: item.unit_id,
          department_id: item.department_id
        }
      })
    );
    return new SuccessModel({
      msg: '添加成功',
      data: res_
    })
  } catch (e) {
    return new ErrorModel({msg: e.message});
  }
}

/**
 * 批量添加用户
 */
async function addUserBatchingAndReturnList (imported_array) {
  try {
    await batchImportedUser(imported_array);
    // await userDepartmentService.addDepartmentBatching(imported_array);
    const res = await getUserList();
    const res_ = await Promise.all(
      res.map(async (item) => {
        const cal = await unitService.lookupUnit(Number(item.unit_id));
        const calRoleObj = await getRole(item._doc.role_id);
        return {
          _id: item._id,
          user_name: item.user_name,
          role_name: calRoleObj.role_name,
          account: item.account,
          password: item.password,
          activation_status: item.activation_status,
          unit_name: cal,
          unit_id: item.unit_id,
          department_id: item.department_id
        }
      })
    )
    return new SuccessModel({
      msg: '添加成功',
      data: res_
    })
  } catch (error) {
    return new ErrorModel({msg: error.message});
  }
}

/**
 * 用于返回一个变化后的全体列表
 * @return {Promise<SuccessModel | ErrorModel>} 
 */
async function returnUserList (role_id) {
  try {
    const res = await getUserList();
    const res_ = await Promise.all(
      res.map(async (item) => {
        const cal = await unitService.lookupUnit(Number(item.unit_id));
        const calRoleObj = await getRole(item.role_id);
        return {
          _id: item._id,
          user_name: item.user_name,
          role_name: calRoleObj,
          account: item.account,
          password: item.password,
          activation_status: item.activation_status,
          unit_name: cal,
          unit_id: item.unit_id,
          department_id: item.department_id
        }
      })
    );
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
async function updateUserAndReturnList (user_name, password, role_id, account, new_account) {
  try {
    await updateUser(user_name, password, role_id, account, new_account);
    const res = await getUserList()
    const res_ = await Promise.all(
      res.map(async (item) => {
        const cal = await unitService.lookupUnit(Number(item.unit_id));
        const calRoleObj = await getRole(item._doc.role_id);
        return {
          _id: item._id,
          user_name: item.user_name,
          role_name: calRoleObj.role_name,
          account: item.account,
          password: item.password,
          activation_status: item.activation_status,
          unit_name: cal,
          unit_id: item.unit_id,
          department_id: item.department_id
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
    // await userDepartmentService.deleteUserAndDepartment(account);
    const res = await getUserList();
    const res_ = await Promise.all(
      res.map(async (item) => {
        const cal = await unitService.lookupUnit(Number(item.unit_id));
        const calRoleObj = await getRole(item._doc.role_id);
        return {
          _id: item._id,
          user_name: item.user_name,
          role_name: calRoleObj.role_name,
          account: item.account,
          password: item.password,
          activation_status: item.activation_status,
          unit_name: cal,
          unit_id: item.unit_id,
          department_id: item.department_id
        }
      })
    )
    return new SuccessModel({
      msg: '删除成功',
      data: res_
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
        const cal = await unitService.lookupUnit(Number(item.unit_id));
        const calRoleObj = await getRole(item._doc.role_id);
        return {
          _id: item._id,
          user_name: item.user_name,
          role_name: calRoleObj.role_name,
          account: item.account,
          password: item.password,
          activation_status: item.activation_status,
          unit_name: cal,
          unit_id: item.unit_id,
          department_id: item.department_id
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
    const Act = await setActivation(account);
    const res = await getUserList();
    const res_ = await Promise.all(
      res.map(async (item) => {
        const cal = await unitService.lookupUnit(Number(item.unit_id));
        const calRoleObj = await getRole(item._doc.role_id);
        return {
          _id: item._id,
          user_name: item.user_name,
          role_name: calRoleObj.role_name,
          account: item.account,
          password: item.password,
          activation_status: item.activation_status,
          unit_name: cal,
          unit_id: item.unit_id,
          department_id: item.department_id
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
  addUserBatchingAndReturnList,
  returnUserList,
  updateUserAndReturnList,
  deleteUserAndReturnList,
  searchUserAndReturnList,
  setActivationAndReturn
}