const express = require('express');
const router = express.Router();
const {
    addRole,
    deleteRole,
    updateRole,
    getRole,
    searchRole,
    updatePermissions// HACK(钟卓江)：感觉可以和其他非权限信息更新合在一起
} = require("../controller/roleController")

function setStatusCode(res, data) {
    if (data.code === 200) {
        res.statusCode = 200
    } else {
        res.statusCode = 404
    }
}

/* 角色和权限相关的路由处理. */

/**
 * 增加角色
 */
 router.get('/v1/role', async (req, res, next) => {
    let roleData = req.query
    let data = await addRole(roleData)
    setStatusCode(res, data)
    res.json(data)
})

/**
 * 删除角色
 */
 router.delete('/v1/role', async (req, res, next) => {
    let roleData = req.query
    let data = await deleteRole(roleData)
    setStatusCode(res, data)
    res.json(data)
})

/**
 * 更新角色非权限相关的信息
 */
router.post('/v1/role', async (req, res, next) => {
    let roleData = req.body;
    let data = await updateRole(roleData);
    setStatusCode(res, data)
    res.json(data)
})

/**
 * 获取角色信息
 */
router.get('/v1/role', async (req, res, next) => {
    let roleData = req.query
    let data = await getRole(roleData)
    setStatusCode(res, data)
    res.json(data)
})

/**
 * 搜索角色
 */
router.post('/v1/searchRole', async (req, res, next) => {
    let searchData = req.body
    let data = await searchRole(searchData)
    setStatusCode(res, data)
    res.json(data)
})

// HACK（钟卓江）: 可能不需要，可以删掉
// /**
//  * 获取角色权限
//  */
// router.get('/v1/rolePermissions', async (req, res, next) => {
//     let roleData = req.query
//     let data = await getPermissions(roleData)
//     setStatusCode(res, data)
//     res.json(data)
// })
// 
// /**
//  * 更新角色权限
//  */
//  router.post('/v1/rolePermissions', async (req, res, next) => {
//     let roleData = req.query
//     let data = await updatePermissions(roleData)
//     setStatusCode(res, data)
//     res.json(data)
// })

module.exports = router;