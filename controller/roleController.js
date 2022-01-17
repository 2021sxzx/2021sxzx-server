/**
 * 角色-权限管理
 */
const {
    addRole_,
    deleteRole_,
    updateRole_,
    getRole_,
    searchRole_,
    updatePermissions_// XXX（钟卓江）：能不能把权限和非权限的更新写到一起？
} = require("../service/roleService")
const { SuccessModel, ErrorModel } = require('../utils/resultModel');

/**
 * 增加角色
 * @param {*} roleData 
 * @returns 
 */
async function addRole(roleData) {
    try {
        const data = await addRole_(roleData.roleName,roleData.roleDescribe,roleData.permissions)
        return new SuccessModel({ msg: '增加角色成功', data: data });
    } catch (e) {
        return new ErrorModel({ msg: e.message })
    }
}

/**
 * 删除角色
 * @param {*} roleData 
 * @returns 
 */
 async function deleteRole(roleData) {
    try {
        const data = await deleteRole_(roleData.roleName)
        return new SuccessModel({ msg: '删除角色成功', data: data });
    } catch (e) {
        return new ErrorModel({ msg: e.message })
    }
}

/**
 * 更新角色信息
 * @param {*} roleData 
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
async function updateRole(roleData) {
    try {
        const data = await updateRole_(roleData.roleName,roleData.roleDescribe,roleData.permissions);// 权限为空
        return new SuccessModel({ msg: '更新角色信息成功', data: data });
    } catch (e) {
        return new ErrorModel({ msg: e.message })
    }
}

/**
 * 获取角色信息
 * @param {*} roleData 
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
async function getRole(roleData) {// XXX(钟卓江)：这个roleData应该可以删掉
    try {
        const data = await getRole_()
        return new SuccessModel({ msg: '获取角色信息成功', data: data });
    } catch (e) {
        return new ErrorModel({ msg: e.message })
    }
}

/**
 * 搜索角色
 * @param searchData
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
 async function searchRole(searchData) {
    try {
        const data = await searchRole_(searchData.roleName)
        return new SuccessModel({ msg: '搜索角色成功', data: data });
    } catch (e) {
        return new ErrorModel({ msg: e.message })
    }
}

module.exports = {
    addRole,
    deleteRole,
    updateRole,
    getRole,
    searchRole
}
