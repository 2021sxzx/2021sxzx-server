const roleMapPermission = require('../model/roleMapPermission');
const permission = require('../model/permission')

/**
 * 添加角色权限，在角色权限关联表里面进行添加
 * @param role_id
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
 * 删除角色所有权限
 */
async function deletePermission (role_id) {
  try {
    let needDeleteData = await roleMapPermission.deleteMany({
      role_id
    })
    return needDeleteData
  } catch (error) {
    throw new Error(e.message)
  }
}

// 查找角色权限
async function searchPermission (role_id) {
  try {
    let resArr = await roleMapPermission.find({
      role_id: role_id
    })
    return resArr;
  } catch {
    throw new Error(e.message);
  }
}

// 修改角色权限
async function patchPermission (role_id, ...permission_identifier_array) {
  try {
    await deletePermission(role_id);
    const res = await addPermission(role_id, ...permission_identifier_array);
    return res;
  } catch {
    throw new Error(e.message)
  }
}

/**
 * 列出权限列表
 * @return {Promise<Array[]>}
 */ 
async function getPermissionList () {
  try {
    const res = await permission.find({})
    return res
  } catch (e) {
    throw new Error(e.message)
  }
}

module.exports = {
  addPermission,
  deletePermission,
  searchPermission,
  patchPermission,
  getPermissionList
}