const role = require('../model/role')
const roleMapPermission = require('../model/roleMapPermission')
const users = require('../model/users')
const permission = require('../model/permission')

/**
 * 添加角色【肯定也要随之添加权限】
 * @param role_name
 * @param role_describe
 * @param permission_identifier_array [Array]
 * @return {Promise} 返回值是一个角色，没有角色对应的权限
 * 得要是一个数组，就不太好了。因为不好携带
 */
async function addRole (role_name, role_describe, ...permission_identifier_array) {
  try {   
    // 控制保证必须有输入权限
    if (new Set(permission_identifier_array).length <= 1) {
      throw new Error("权限数组不够噢")
    }

    // 列出所有角色
    const roleList = await role.find({})

    // 后台检查是否有同样的数据，如果有，就不允许插入
    roleList.forEach((item) => {
      if (role_name === item.role_name && role_describe === item.role_describe) {
        throw new Error("不允许插入噢")
      }
    })

    // 往权限角色关联表里面添加关联
    Promise.all(
      permission_identifier_array.map(async (item) => {
        const res = await roleMapPermission.create({
          role_name: role_name,
          permission_identifier: item
        })
        return res
      })
    )

    // 添加角色
    const res = await role.create({
      role_name: role_name,
      role_describe: role_describe
    })

    // 返回一个角色，没有权限
    return res

  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 * 查找一个角色
 * @param {*} role_name 
 * @param {*} role_describe 
 * @returns {Promise<>} 返回一个角色，没有对应权限
 */
async function getRole (role_name, role_describe) {
  try {
    const roleObj = await role.find({
      role_name: role_name, 
      role_describe: role_describe
    })
    return roleObj
  } catch (error) {
    throw new Error(error.message)
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

/**
 * 
 * @param {*} role_name 
 * @param {*} role_describe 
 * @returns 
 */
async function updateRole (role_name_old, role_name, role_describe) {
  try {
    const res = await role.updateOne({
      role_name: role_name_old
    }, {
      role_name: role_name,
      role_describe: role_describe
    })

    await roleMapPermission.updateMany({
      role_name: role_name_old
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
      throw new Error("有用户在使用该角色，不允许删除")
    }
    const res = await role.deleteOne({
      role_name: role_name,
      role_describe: role_describe
    })
    return res
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
  // 如果搜索值为空就任意匹配所有非换行符之外的字符
  if(!searchValue){
    searchValue='.'
  }
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

/**
 * 添加角色权限，在角色权限关联表里面进行添加
 * @param role_name
 * @param permission_identifier_array
 * @return {Promise<*>}
 */
async function addPermission (role_name, ...permission_identifier_array) {
  try {
    let addedArr = await Promise.all(
      permission_identifier_array.map(async (item) => {
        const res = await roleMapPermission.create({
          role_name: role_name,
          permission_identifier: item
        })
        return res
      })
    )

    return addedArr

  } catch (error) {
    throw new Error(e.message)
  }
}

/**
 * 删除角色权限
 */
async function deletePermission (role_name) {
  try {
    let needDeleteData = await roleMapPermission.deleteMany({
      role_name: role_name
    })
    return needDeleteData
  } catch (error) {
    throw new Error(e.message)
  }
}

module.exports = {
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
}