const role = require('../model/role')
const roleMapPermission = require('../model/roleMapPermission')
const users = require('../model/users')
const permission = require('../model/permission')

// 在此，role_rank不能作为访问控制的一环，已经作为一个废弃的量来处理

function searchPermissionName (permission_identifier, permissionList) {
  for (let item of permissionList) {
    if (item.permission_identifier === permission_identifier) {
      return item.permission;
    }
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
 */
async function addRole (role_name, role_describe, permission_identifier_array, role_rank = 1) {
  try {

    // 添加角色
    const res = await role.create({
      role_name,
      role_describe,
      role_rank,
      role_id: Date.now()
    });

    // 往权限角色关联表里面添加关联
    // 多次插入，可能影响效率，后续做一次性优化处理
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
 * 已废弃
 * @param {*} role_name 
 * @param {*} role_describe 
 * @returns {Promise<>} 返回一个角色，有对应权限
 */
async function getRole () {
  try {
    const resq = await role.aggregate([
      {
        $lookup: {
          from: 'rolemappermissions',
          localField: 'role_id',
          foreignField: 'role_id',
          as: "info1"
        }
      }, {
        $project: {
          role_name: 1,
          role_id: 1,
          role_describe: 1,
          permission_identifier_array: '$info1.permission_identifier'
        }
      }
    ]);
    const permissionList = await permission.find({});
    resq.map(item => {
      item["permission"] = item.permission_identifier_array.map(item => {
        return searchPermissionName(item, permissionList);
      });
      return item;
    });
    return resq;
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
    const resq = await role.aggregate([
      {
        $lookup: {
          from: 'rolemappermissions',
          localField: 'role_id',
          foreignField: 'role_id',
          as: "info1"
        }
      }, {
        $project: {
          role_name: 1,
          role_id: 1,
          role_describe: 1,
          permission_identifier_array: '$info1.permission_identifier'
        }
      }
    ]);
    const permissionList = await permission.find({});

    resq.map(item => {
      item["permission"] = item.permission_identifier_array.map(item => {
        return searchPermissionName(item, permissionList);
      });
      return item;
    });
    return resq
  } catch (e) {
    throw new Error(e.message);
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
    const resq = await role.aggregate([
      {
        $lookup: {
          from: 'rolemappermissions',
          localField: 'role_id',
          foreignField: 'role_id',
          as: "info1"
        }
      }, {
        $match: {
          $or: [
            {
              role_name: { $regex : reg }
            }, {
              role_describe: { $regex : reg }
            }
          ]
        }
      }, {
        $project: {
          role_name: 1,
          role_id: 1,
          role_describe: 1,
          permission_identifier_array: '$info1.permission_identifier'
        }
      }
    ]);
    const permissionList = await permission.find({});

    resq.map(item => {
      item["permission"] = item.permission_identifier_array.map(item => {
        return searchPermissionName(item, permissionList);
      });
      return item;
    });
    return resq
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 * 用于计算本角色对应的权限，返回一个本角色对应的权限列表[字符数组]
 * 已废弃
 * @param role_id
 * @return {Array[]}
 */
async function calcaulatePermission (role_id) {
  try {
    // 获取角色权限索引值列表
    const permissionFindArrPrv = await roleMapPermission.find({
      role_id: role_id
    })
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
// 已废弃
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
    const res = permission.find({});
    return res;
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 * 添加角色权限，在角色权限关联表里面进行添加
 * 这里可以进行优化，要做一次性的添加，不要逐次添加
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