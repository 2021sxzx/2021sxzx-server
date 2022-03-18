const {
  addRole,
  getRole,
  getRoleList,
  updateRole,
  deleteRole,
  SearchRole,
  calcaulatePermission,
  getPermissionList,
  addPermission,
  deletePermission
} = require('../service/roleService')
const { SuccessModel, ErrorModel } = require('../utils/resultModel')

/**
 * 添加一个角色，并且返回一个角色供前端渲染
 * @param {*} role_name
 * @param {*} role_describe
 * @param  {...any} permission_identifier_array
 */
async function addRoleAndReturnObject (
  role_name,
  role_describe,
  ...permission_identifier_array
) {
  try {
    await addRole(role_name, role_describe, ...permission_identifier_array)
    const res = await getRole(role_name, role_describe);

    return new SuccessModel({
      msg: '添加角色列表成功',
      data: res,
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
async function updateRoleAndReturnObject (role_name_old, role_name, role_describe) {
  try {
    const res = await updateRole(role_name_old, role_name, role_describe)
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
    const roleList = await getRoleList()
    const permissionList = await Promise.all(
      await roleList.map(async (item) => {
        const permissions = await calcaulatePermission(item.role_name)
        return permissions
      })
    )
  
    let res = []
  
    for (let i = 0; i < roleList.length; i++) {
      res.push({
        role_name: roleList[i].role_name,
        role_describe: roleList[i].role_describe,
        permission: permissionList[i]
      })
    }
  
    return new SuccessModel({
      msg: '返回角色权限列表成功',
      data: res
    })

  } catch (error) {
    throw new ErrorModel({
      msg: error.message
    })
  }
}

/**
 * 删除角色
 * @param {*} role_name 
 * @returns {Promise<*>} 
 */
async function deleteRoleAndReturnObject (role_name, role_describe) {
  try {
    const res = await deleteRole(role_name, role_describe)
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
async function getPermissionListAndReturnObject () {
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
async function searchRoleAndReturnObject (searchValue) {
  try {
    const Role = await SearchRole(searchValue) // 多个角色的数组
    
    let Permission = await Promise.all(
      Role.map(async item => {
        const res = await calcaulatePermission(item.role_name);
        return res;
      })
    )

    const res = Role.map((item, index) => {
      return {
        role_name: item.role_name,
        role_describe: item.role_describe,
        permission: Permission[index]
      }
    })

    return new SuccessModel({
      msg: '搜索成功',
      data: res
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
async function updatePermission (role_name, permission_identifier_array) {
  try {
    await deletePermission(role_name)
    const res = await addPermission(role_name, permission_identifier_array)
    return res
  } catch (error) {
    throw new ErrorModel({
      msg: error.message
    })
  }
}

module.exports = {
  addRoleAndReturnObject,
  updateRoleAndReturnObject,
  returnRoleList,
  deleteRoleAndReturnObject,
  getPermissionListAndReturnObject,
  searchRoleAndReturnObject,
  updatePermission
}