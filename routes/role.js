const express = require('express');
const router = express.Router();
const {
  addRoleAndReturnObject,
  updateRoleAndReturnObject,
  returnRoleList,
  deleteRoleAndReturnObject,
  getPermissionListAndReturnObject,
  searchRoleAndReturnObject
} = require("../controller/roleController");

const {
  calcaulatePermission
} = require('../service/roleService')

const {
  isActivation,
  setActivation
} = require('../service/userManagementService');

function setStatusCode(res, data) {
    if (data.code === 200) {
        res.statusCode = 200
    } else {
        res.statusCode = 404
    }
}
router.get('/test', async (req, res, next) => {
  const resq = await setActivation('18029000390');
  res.json(resq);
})
/**
 * 添加角色
 */
router.post('/v1/role', async (req, res, next) => {
  const {role_name, role_describe, permission_identifier_array, role_rank} = req.body
  let data = await addRoleAndReturnObject(
    role_name,
    role_describe,
    permission_identifier_array,
    role_rank
  )
  setStatusCode(res, data)
  res.json(data)
})

/**
 * 删除角色
 */
router.delete('/v1/role', async (req, res, next) => {
  let role = req.body
  let data = await deleteRoleAndReturnObject(Number(role.role_id));
  setStatusCode(res, data)
  res.json(data)
})

/**
 * 更新角色非权限相关的信息
 */
router.patch('/v1/role', async (req, res, next) => {
  let role = req.body
  let data = await updateRoleAndReturnObject(role.role_name, Number(role.role_id), role.role_describe)
  setStatusCode(res, data)
  res.json(data)
})

/**
 * 获取角色列表
 */
router.get('/v1/role', async (req, res, next) => {
  const {role_id} = req.query;
  let data = await returnRoleList(Number(role_id))
  setStatusCode(res, data)
  res.json(data)
})

/**
 * 搜索角色
 */
router.post('/v1/searchRole', async (req, res, next) => {
  let {searchValue} = req.body
  let data = await searchRoleAndReturnObject(searchValue)
  setStatusCode(res, data)
  res.json(data)
})

/**
 * 修改用户权限
 */
// router.patch('/v1/permission', async (req, res, next) => {
//   let {role_name} = req.body
//   let data = await calcaulatePermission(role_name)
//   res.json(data);
// })

/**
 * 列出权限列表
 * 这个地方是测试
 */
// router.get('/v1/permissionList', async (req, res, next) => {
//   let data = await getPermissionListAndReturnObject()
//   setStatusCode(res, data)
//   res.json(data)
// })

module.exports = router;