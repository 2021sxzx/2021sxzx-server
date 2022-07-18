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
    const insertValue = permission_identifier_array.map(item => {
      return {
        role_id: res.role_id,
        permission_identifier: item
      }
    });
    await roleMapPermission.create(insertValue);
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
    //这个是权限的名称和对应的identitifier 
    //eg:{    _id: new ObjectId("628da531bb460000a4000f82"),
    //permission: '机构管理',
    //permission_identifier: 8}
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
    // console.log("getRole返回值:\n",resq)
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
    // const permissionFindArrPrv = await roleMapPermission.find({
    //   role_id: 1657007883579
    // })
    // console.log("In getRoleList,Test2's permission:\n",permissionFindArrPrv)
    // const permissionFindArrPrve = await roleMapPermission.find({
    //   role_id: 1657090863413
    // })
    // console.log("In getRoleList,Test's permission:\n",permissionFindArrPrve)
    if (roleList == null || isNeedUpdateRoleList == true) {
      resq = await role.aggregate([
        {//多表查询
          /*
          from: 指定要与之连接的同一数据库中的集合
          localField : 指定从文档[role]输入到查询的字段，与foreignField进行匹配
          forergnField : 指定from集合中的字段，与localField进行匹配
          as:指定要添加到输入文档的新数组字段的名称。新的数组字段包含来自from集合的匹配文档。如果指定的名称已经存在于输入文档中，则覆盖现有字段。
          */
          $lookup: {
            from: 'rolemappermissions',
            localField: 'role_id',
            foreignField: 'role_id',
            as: "info1"
          }
        }, {
          //投射，选择想要的字段或对字段进行重命名，为1表示保留哪个字段
          $project: {
            role_name: 1,
            role_id: 1,
            role_describe: 1,
            permission_identifier_array: '$info1.permission_identifier'
          }
        }
      ]);
      roleList = resq;
      // console.log("resq:",resq[6],req[7])
      isNeedUpdateRoleList = false;
    } else {
      // console.log("I'm getting last roleList")
      // console.log("isNeedUpdate is:",isNeedUpdateRoleList)
      resq = roleList;
    }
    if (permissionList == null) {
      const _permissionList = await permission.find({});
      permissionList = _permissionList;
    }

    resq.forEach(item => {
      item["permission"] = item.permission_identifier_array.map(item => {
        return searchPermissionName(item, permissionList);
      });
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
    const insertValue = permission_identifier_array.map(item => {
      return {
        role_id,
        permission_identifier: item
      }
    });
    return await roleMapPermission.create(insertValue);

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