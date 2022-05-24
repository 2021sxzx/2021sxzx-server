const {
  addRole,
  getRole,
  getRoleList,
  updateRole,
  deleteRole,
  SearchRole,
  calcaulatePermission,
  calcaulatePermissionIdentifier,
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
 * 有一个bug，就是这个role_id不存在
 */
async function addRoleAndReturnObject (
  role_name,
  role_describe,
  permission_identifier_array,
  role_rank
) {
  try {
    const resq = await addRole(role_name, role_describe, permission_identifier_array, role_rank);
    // id在哪里？
    const res = await getRole(resq.role_id);
    const calPermission = await calcaulatePermission(resq.role_id);

    return new SuccessModel({
      msg: '添加角色列表成功',
      data: {
        role_name: res.role_name,
        role_describe: res.role_describe,
        permission: calPermission,
        role_id: res.role_id
      }
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
async function updateRoleAndReturnObject (role_name, role_id, role_describe) {
  try {
    const res = await updateRole(role_name, role_id, role_describe)
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
async function returnRoleList (role_id) {
  try {
    const roleList = await getRoleList(role_id);
    const permissionList = await Promise.all(
      await roleList.map(async (item) => {
        const permissions = await calcaulatePermission(item.role_id);
        console.log(permissions)
        const permissionIdentifierArray = await calcaulatePermissionIdentifier(item.role_id);
        return {
          permissions,
          permissionIdentifierArray
        };
      })
    )
    let res = []
  
    for (let i = 0; i < roleList.length; i++) {
      res.push({
        role_name: roleList[i].role_name,
        role_id: roleList[i].role_id,
        role_describe: roleList[i].role_describe,
        permission: permissionList[i].permissions,
        permission_identifier_array: permissionList[i].permissionIdentifierArray
      });
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
 * @param {*} role_id 
 * @returns {Promise<*>} 
 */
async function deleteRoleAndReturnObject (role_id) {
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
        const res = await calcaulatePermission(item.role_id);
        return res;
      })
    )

    const res = Role.map((item, index) => {
      return {
        role_name: item.role_name,
        role_describe: item.role_describe,
        role_id: item.role_id,
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
async function updatePermission (role_id, permission_identifier_array) {
  try {
    await deletePermission(role_id)
    const res = await addPermission(role_id, permission_identifier_array)
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