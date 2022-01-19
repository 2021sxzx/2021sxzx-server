const role = require('../model/role')
const roleMapPermission = require('../model/roleMapPermission')
const promission = require('../model/permission')
const users = require('../model/users')
const permission = require('../model/permission')

/**
 * 添加角色【肯定也要随之添加权限】
 * @param role_name
 * @param role_describe
 * @param permission_identifier_array [Array]
 * 得要是一个数组，就不太好了。因为不好携带
 */
async function addRole (role_name, role_describe, permission_identifier_array) {
  try {
    // 控制保证必须有输入权限
    if (Set(permission_identifier_array).length <= 1) {
      throw new Error(e.message)
    }

    // 往权限角色关联表里面添加关联
    permission_identifier_array.map(async (item) => {
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

    return {
      isAdd: true
    }
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

/**
 * 返回搜索值
 * @param searchValue
 * @return {Promise<Array[]>} 
 **/ 
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
 * @return {Array[]}
 */
async function calcaulatePermission (role_name) {
  try {
    // 获取角色权限索引值列表
    const permissionFindArrPrv = await roleMapPermission.find({
      role_name: role_name
    })

    // 获取角色名称
    const permissionFindArr = await Promise.all(
      permissionFindArrPrv.map(async (item) => {
        const permission_identifier = item.permission_identifier
  
        let Item = await permission.findOne({
          permission_identifier: permission_identifier
        })
        return Item.permission
      })
    )

    return permissionFindArr

  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 * 列出权限列表
 * @return {Promise<Array[]>}
 */ 
async function getPermissionList () {
  try {
    const res = permission.find({})
    return res
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
  calcaulatePermission,
  getPermissionList
}