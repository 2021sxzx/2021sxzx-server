const {
  addRole,
  getRoleList,
  updateRole,
  deleteRole,
  SearchRole,
  getPermissionList,
  addPermission,
  deletePermission
} = require('../service/roleService');
const { SuccessModel, ErrorModel } = require('../utils/resultModel')

/**
 * 添加一个角色，并且返回一个角色供前端渲染
 * @param {*} role_name
 * @param {*} role_describe
 * @param {*} role_rank
 * @param  {Array} permission_identifier_array
 * role_id用时间戳
 */
async function addRoleAndReturnList (
  role_name,
  role_describe,
  permission_identifier_array,
  role_rank = 1
) {
  try {
    await addRole(role_name, role_describe, permission_identifier_array, role_rank = 1);
    // 不需要id
    const res = await getRoleList();

    return new SuccessModel({
      msg: '添加角色列表成功',
      data: res
    })
  } catch (e) {
    throw new ErrorModel({
      msg: '添加角色列表失败',
      data: e.message,
    })
  }
}

/**
 * 更新一个角色，并返回一个角色供前端渲染
 * @param {*} role_name
 * @param {*} role_describe
 */
async function updateRoleAndReturnList (role_name, role_id, role_describe) {
  try {
    await updateRole(role_name, role_id, role_describe)
    const res = await getRoleList();
    return new SuccessModel({
      msg: '更新用户角色成功',
      data: res
    })
  } catch (e) {
    throw new ErrorModel({
      msg: '更新角色列表失败',
      data: e.message,
    })
  }
}

/**
 * 返回一个角色权限列表
 * @returns {Promise<Array[]>}
 */
async function returnRoleList () {
  try {
    const roleList = await getRoleList();
    // console.log("In returnRoleList:",roleList)
    return new SuccessModel({
      msg: '返回角色权限列表成功',
      data: roleList
    })

  } catch (error) {
    throw new ErrorModel({
      msg: error.message
    })
  }
}

/**
 * 删除角色
 * @param {*} role_id 
 * @returns {Promise<*>} 
 */
async function deleteRoleAndReturnList (role_id) {
  try {
    const res = await deleteRole(role_id);
    await deletePermission(role_id);
    return new SuccessModel({
      msg: '删除成功',
      data: res
    })
  } catch (error) {
    throw new ErrorModel({
      msg: error.message
    })
  }
}

/**
 * 返回一个权限列表
 */
async function getPermissionListAndReturnList () {
  try {
    const res = await getPermissionList()
    return new SuccessModel({
      msg: '返回权限成功',
      data: res
    })
  } catch (error) {
    throw new ErrorModel({
      msg: error.message
    })    
  }
}

/**
 * 搜索角色
 * @param {*} searchValue 
 * @returns {Promise<Array[]>}
 */
async function searchRoleAndReturnList (searchValue) {
  try {
    const Role = await SearchRole(searchValue) // 多个角色的数组
    return new SuccessModel({
      msg: '搜索成功',
      data: Role
    })

  } catch (error) {
    throw new ErrorModel({
      msg: error.message
    })
  }
}

/**
 * 修改角色权限
 * @param {*} role_name 
 * @param {*} permission_identifier_array 
 */
async function updatePermission (role_id, permission_identifier_array) {
  try {
    await deletePermission(role_id)
    await addPermission(role_id, ...permission_identifier_array);
    const res = await getRoleList();

    return new SuccessModel({
      msg: '修改角色权限成功',
      data: res
    })
  } catch (error) {
    throw new ErrorModel({
      msg: error.message
    })
  }
}

module.exports = {
  addRoleAndReturnList,
  updateRoleAndReturnList,
  returnRoleList,
  deleteRoleAndReturnList,
  getPermissionListAndReturnList,
  searchRoleAndReturnList,
  updatePermission
}