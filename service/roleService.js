const role = require('../model/role')
const roleMapPermission = require('../model/roleMapPermission')
const users = require('../model/users')
const permission = require('../model/permission')

async function findRank (role_name) {
  try {
    const rank = role.find({role_name});
    if (!rank) {
      return
    } else {
      return rank.role_rank;
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

// 判断是否可以CRUD的函数 
function compareRankAndJudge (role_rank1, role_rank2) {
  try {
    if (role_rank1 > role_rank2 || Math.abs(role_rank1 - role_rank2) !== 1) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * 添加角色【肯定也要随之添加权限】
 * @param role_name
 * @param role_describe
 * @param permission_identifier_array [Array]
 * @return {Promise} 返回值是一个角色，没有角色对应的权限
 * 得要是一个数组，就不太好了。因为不好携带
 * 
 * 还必须知道这里操控用户的rank值，只能添加下一级的rank的角色
 * 操控用户的rank值：adder_rank
 */
async function addRole (role_name, role_describe, permission_identifier_array, role_rank) {
  try {
    // // 控制保证必须有输入权限
    // if (new Set(permission_identifier_array).length <= 1) {
    //   throw new Error("权限数组不够噢")
    // }

    // // 列出所有角色
    // const roleList = await role.find({})

    // // 后台检查是否有同样的数据，如果有，就不允许插入
    // roleList.forEach((item) => {
    //   if (role_name === item.role_name && role_describe === item.role_describe) {
    //     throw new Error("不允许插入噢")
    //   }
    // })

    // 添加角色
    const res = await role.create({
      role_name,
      role_describe,
      role_rank,
      role_id: Date.now()
    });

    // 往权限角色关联表里面添加关联
    permission_identifier_array.forEach((item) => {
      roleMapPermission.create({
        role_id: res.role_id,
        permission_identifier: item
      })
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
async function getRole (role_id) {
  try {
    const roleObj = await role.findOne({
      role_id
    }, {
      role_name: 1,
      role_describe: 1,
      role_rank: 1,
      role_id: 1
    });
    // console.log(roleObj === null);
    return roleObj === null ? '未添加角色' : roleObj.role_name;
  } catch (error) {
    throw new Error(error.message)
  }
}

/**
 * 返回一个角色列表
 * @return {Promise<Array[]>}
 */
async function getRoleList (role_id) {
  try {
    const _role = await role.findOne({role_id});
    let rank = Number(_role.role_rank);
    const res = await role.find({
      role_rank: rank + 1
    })
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
async function updateRole (role_name, role_id, role_describe) {
  try {
    await role.updateOne({
      role_id
    }, {
      role_name,
      role_describe
    });

    const res = await role.findOne({
      role_id
    });
    return res
  } catch (e) {
    throw new Error(e.message)
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
async function deleteRole (role_id) {
  try {
    const selectRoleMap = await users.find({
      role_id
    })
    if (selectRoleMap.length > 0) {
      return new Error("有用户在使用该角色，不允许删除")
    }
    const res = await role.deleteOne({
      role_id
    })
    return res;
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
 * @param role_id
 * @return {Array[]}
 */
async function calcaulatePermission (role_id) {
  try {
    // 获取角色权限索引值列表
    const permissionFindArrPrv = await roleMapPermission.find({
      role_id: role_id
    })
    console.log(permissionFindArrPrv);
    // 获取角色名称
    const permissionFindArr = await Promise.all(
      permissionFindArrPrv.map(async (item) => {
        const permission_identifier = item.permission_identifier
  
        let Item = await permission.findOne({
          permission_identifier: permission_identifier
        })
        return Item.permission;
      })
    )

    return permissionFindArr

  } catch (e) {
    throw new Error(e.message)
  }
}

async function calcaulatePermissionIdentifier (role_id) {
  try {
    // 获取角色权限索引值列表
    const permissionFindArrPrv = await roleMapPermission.find({
      role_id: role_id
    })
    // 获取角色名称
    const permissionFindArr = await Promise.all(
      permissionFindArrPrv.map(async (item) => {
        return item.permission_identifier
      })
    )
    console.log(role_id, permissionFindArr)
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
async function addPermission (role_id, ...permission_identifier_array) {
  try {
    let addedArr = await Promise.all(
      permission_identifier_array.map(async (item) => {
        const res = await roleMapPermission.create({
          role_id,
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
async function deletePermission (role_id) {
  try {
    let needDeleteData = await roleMapPermission.deleteMany({
      role_id
    })
    return needDeleteData
  } catch (error) {
    throw new Error(e.message);
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
  calcaulatePermissionIdentifier,
  getPermissionList,
  addPermission,
  deletePermission
}