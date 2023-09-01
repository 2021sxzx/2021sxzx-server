const express = require('express');
const router = express.Router();
const {
    addRoleAndReturnList,
    updateRoleAndReturnList,
    returnRoleList,
    deleteRoleAndReturnList,
    searchRoleAndReturnList
} = require("../controller/roleController");
const permission = require('../model/permission');
const {validateString} = require("../utils/validateString");
const {routerProtection}=require("../utils/validateJwt")

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
    // 检查输入字符串合法性
    const role_name = validateString(req.body.role_name).legalStr
    const role_describe = validateString(req.body.role_describe).legalStr
    const permission_identifier_array = req.body.permission_identifier_array

    let data = await addRoleAndReturnList(
        role_name,
        role_describe,
        permission_identifier_array
    )
    setStatusCode(res, data)
    res.json(data)
})

/**
 * 删除角色
 */
router.delete('/v1/role', async (req, res, next) => {
    let role = req.body
    let data = await deleteRoleAndReturnList(Number(role.role_id));
    setStatusCode(res, data)
    res.json(data)
})

/**
 * 更新角色非权限相关的信息
 */
router.patch('/v1/role', async (req, res, next) => {
    // 检查输入字符串合法性
    const role_name = validateString(req.body.role_name).legalStr
    const role_id = Number(validateString(req.body.role_id))
    const role_describe = validateString(req.body.role_describe).legalStr

    let data = await updateRoleAndReturnList(role_name, role_id, role_describe)
    setStatusCode(res, data)
    res.json(data)
})

/**
 * 获取角色列表
 */
router.get('/v1/role' , routerProtection ,async (req,res,next)=>{
    const authToken=req.cookies['auth-token'] || null;
    if(authToken){
        next();
    }else {
        res.status(403).send('您还未登录，不能获取该数据');
    }
},async (req, res, next) => {
    const {role_id} = req.query;
    let data = await returnRoleList(Number(role_id))

    // console.log("In get role:",data)
    setStatusCode(res, data)
    res.json(data)
});

/**
 * 搜索角色
 */
router.post('/v1/searchRole', async (req, res, next) => {
    let {searchValue} = req.body
    let data = await searchRoleAndReturnList(searchValue)
    setStatusCode(res, data)
    res.json(data)
});


module.exports = router;
