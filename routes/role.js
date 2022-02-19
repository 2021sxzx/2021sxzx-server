const express = require('express');
const router = express.Router();
const {
  addRoleAndReturnObject,
  updateRoleAndReturnObject,
  returnRoleList,
  deleteRoleAndReturnObject,
  getPermissionListAndReturnObject,
  searchRoleAndReturnObject
} = require("../controller/roleController")

function setStatusCode(res, data) {
    if (data.code === 200) {
        res.statusCode = 200
    } else {
        res.statusCode = 404
    }
}

/**
 * 添加角色
 */
router.post('/v1/role', async (req, res, next) => {
  let role = req.body
  let data = await addRoleAndReturnObject(
    role.role_name,
    role.role_describe,
    role.permission_identifier_array
  )
  setStatusCode(res, data)
  res.json(data)
})

/**
 * 删除角色
 */
router.delete('/v1/role', async (req, res, next) => {
  let role = req.body.data
  let data = await deleteRoleAndReturnObject(role.role_name)
  setStatusCode(res, data)
  res.json(data)
})

/**
 * 更新角色非权限相关的信息
 */
router.patch('/v1/role', async (req, res, next) => {
  let role = req.body
  let data = await updateRoleAndReturnObject(role.role_name, role.role_describe)
  setStatusCode(res, data)
  res.json(data)
})

/**
 * 获取角色列表
 */
router.get('/v1/role', async (req, res, next) => {
  let data = await returnRoleList()
  setStatusCode(res, data)
  res.json(data)
})

/**
 * 搜索角色
 */
router.post('/v1/searchRole', async (req, res, next) => {
  let searchData = req.body
  let data = await searchRoleAndReturnObject(searchData)
  setStatusCode(res, data)
  res.json(data)
})

/**
 * 修改用户权限
 */
router.patch('/v1/permission', async (req, res, next) => {
  let role = req.body
  // let data = await 
})

/**
 * 列出权限列表
 */
router.get('/v1/permissionList', async (req, res, next) => {
  let data = await getPermissionListAndReturnObject()
  setStatusCode(res, data)
  res.json(data)
})


module.exports = router;
