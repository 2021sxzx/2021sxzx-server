const role = require('../model/role')
const roleMapPermission = require('../model/roleMapPermission')
const promission = require('../model/permission')
const users = require('../model/users')

/**
 * @param role_name
 * @param role_describe
 * @param permissions
 */
async function addRole (role_name, role_describe, permission_identifier_array) {
  try {
    const MapToCollectPermissionIdentifier = []
    // 往权限角色关联表里面添加关联
    permission_identifier_array.map(async (item) => {
      MapToCollectPermissionIdentifier.push(item)
      await roleMapPermission.create({
        role_name: role_name,
        permission_identifier: item
      })
    })
    // 添加角色
    await role.create({
      role_name: role_name,
      role_describe: role_describe
    })

  } catch (e) {
    throw new Error(e.message)
  }  
}

/**
 * 返回一个角色列表
 * @return {Promise<Array[]>}
 */
async function getRoleList () {
  try {
    const res = await role.find({})
    return res
  } catch (e) {
    throw new Error(e.message)
  }
}

async function updateRole (role_name, role_describe) {
  try {
    const res = await role.updateOne({
      role_name: role_name
    }, {
      role_name: role_name,
      role_describe: role_describe
    })

    await roleMapPermission.updateMany({
      role_name: role_name
    }, {
      role_name: role_name
    })
    return res
  } catch (e) {
    return new Error(e.message)
  }
}

/**
 * 删除角色，如果该角色有用户绑定中，则不能被删除
 * @param role_name
 * @return {
 *    isDeleted,
 *    data
 * }
 */ 
async function deleteRole (role_name) {
  try {
    const selectRoleMap = await users.find({
      role_name: role_name
    })
    if (selectRoleMap.length > 0) {
      return {
        isDeleted: false,
        data: null
      }
    }
    const res = await role.deleteOne({
      role_name: role_name,
      role_describe: role_describe
    })
    return {
      isDeleted: true,
      data: res
    }
  } catch (e) {
    throw new Error(e.message)
  }
}

async function SearchRole (searchValue) {
  const reg = new RegExp(searchValue, 'i')
  try {
    const res = await role.find({
      $or: [
        {
          role_name: { $regex : reg }
        },{
          role_describe: { $regex : reg }
        }
      ]
    })
    return res
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 * 用于计算本角色对应的权限，返回一个本角色对应的权限列表[字符数组]
 * @param role_name
 * @return {Promise<Array[]>}
 */
async function calcaulatePermission (role_name) {
  try {
    const permissionFindArr = await roleMapPermission.find({
      role_name: role_name
    }, {
      permission_identifier: 0
    })
    return permissionFindArr
  } catch (e) {
    throw new Error(e.message)
  }
} 

module.exports = {
  addRole,
  getRoleList,
  updateRole,
  deleteRole,
  SearchRole,
  calcaulatePermission
}