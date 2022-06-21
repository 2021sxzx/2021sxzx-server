const role = require('../model/role');
const roleMapPermission = require('../model/roleMapPermission');
const users = require('../model/users');
const permission = require('../model/permission');

// 权限列表的缓存
// 因为权限是不涉及CRUD的，因此我们不需要设置锁变量
let permissionList = null;

// 角色列表的缓存
// 角色涉及CRUD，我们需要设置锁变量
let roleList = null;
let isNeedUpdateRoleList = false;

const iniRoleListAndPermissionList  = async () => {
  try {
    await getRole ()
  } catch (err) {
    await iniRoleListAndPermissionList();
  }
}

iniRoleListAndPermissionList();


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
    isNeedUpdateRoleList = true;
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
    if (permissionList == null) {
      const _permissionList = await permission.find({});
      permissionList = _permissionList;
    }
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
    let resq = null;
    if (roleList == null || isNeedUpdateRoleList == true) {
      resq = await role.aggregate([
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
      roleList = resq;
      isNeedUpdateRoleList = false;
    } else {
      resq = roleList;
    }
    if (permissionList == null) {
      const _permissionList = await permission.find({});
      permissionList = _permissionList;
    }

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
    isNeedUpdateRoleList = true;
    const res = await getRoleList();
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
    isNeedUpdateRoleList = true;
    const res = await getRoleList();
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
    let resq = null;
    if (roleList == null) {
      // 如果为空，就加载一下
      await getRoleList();
    }

    resq = roleList.filter(item => {
      const permission = item.permission;
      let isHavePermission = false;
      permission.map(item => {
        if (reg.test(item)) {
          isHavePermission = true;
        }
        return item;
      })
      return reg.test(item.role_name) || reg.test(item.role_describe) || isHavePermission;
    });

    if (permissionList == null) {
      const _permissionList = await permission.find({});
      permissionList = _permissionList;
    }

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
    if (permissionList == null) {
      const _permissionList = await permission.find({});
      permissionList = _permissionList;
    }
    return permissionList;
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
        });
        return res;
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
  deletePermission,
  roleList
}