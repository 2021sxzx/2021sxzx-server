const express = require('express');
const router = express.Router();
const {validatePwd} = require('../utils/validatePwd');
const {ErrorModel} = require('../utils/resultModel');
const {
    addUserAndReturnList,
    addUserBatchingAndReturnList,
    returnUserList,
    updateUserAndReturnList,
    deleteUserAndReturnList,
    searchUserAndReturnList,
    setActivationAndReturn,
    getActivationAndReturn
} = require('../controller/userManagementController');
const {validateString} = require("../utils/validateString");
const {routerProtection}=require("../utils/validateJwt")


function setStatusCode(res, data) {
    if (data.code === 200) {
        res.statusCode = 200
    } else {
        res.statusCode = 404
    }
}

router.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    if (req.method === "OPTIONS") res.sendStatus(200);/*让options请求快速返回*/
    else next();
});

// 获取用户
router.get('/v1/user', routerProtection,async (req, res, next) => {
    // console.log(typeof(req.cookies.unit_id), req.cookies.unit_id)
    const my_unit_id = req.cookies.unit_id
    const unit_id = req.body
    console.log(unit_id)
    const data = await returnUserList(my_unit_id);
    setStatusCode(res, data)
    res.json(data)
});

// 添加用户
router.post('/v1/user', async (req, res, next) => {
    // 检查输入的合法性
    const userName = validateString(req.body.user_name).legalStr
    const account = validateString(req.body.account).legalStr
    const password = validateString(req.body.password).legalStr
    const roleID = Number(validateString(req.body.role_id).legalStr)
    const unitID = validateString(String(req.body.unit_id)).legalStr
    const creatorUnitID = validateString(req.cookies.unit_id).legalStr

    if (validatePwd(password)) {
        const data = await addUserAndReturnList({
            user_name: userName,
            account: account,
            password: password,
            role_id: roleID,
            unit_id: unitID
        }, creatorUnitID);
        setStatusCode(res, data);
        res.json(data)
    } else {
        let result = new ErrorModel({
            msg: '密码不安全，建议使用包含四类不同字符并长度至少为8'
        })
        setStatusCode(res, result);
        res.status(403).json(result);
    }
});

// 修改用户
router.patch('/v1/user', async (req, res, next) => {
    // 检查字符串合法性
    const userName = validateString(req.body.user_name).legalStr
    const account = validateString(req.body.account).legalStr
    const newAccount = validateString(req.body.new_account).legalStr
    const password = validateString(req.body.password).legalStr
    const roleID = Number(validateString(req.body.role_id).legalStr)
    const unitID = validateString(String(req.body.unit_id)).legalStr
    const creatorUnitID = validateString(req.cookies.unit_id).legalStr

    const data = await updateUserAndReturnList(userName, password,
        roleID, account, newAccount, unitID, creatorUnitID)

    setStatusCode(res, data)
    res.json(data)
})

// 删除用户
router.delete('/v1/user', async (req, res, next) => {
    const {account} = req.body
    const data = await deleteUserAndReturnList(account)
    setStatusCode(res, data)
    res.json(data)
})

// 搜索用户
router.post('/v1/searchUser', async (req, res, next) => {
    const {searchValue} = req.body;
    const data = await searchUserAndReturnList(searchValue, req.cookies.unit_id);
    setStatusCode(res, data);
    res.json(data)
})

//
router.post('/v1/getActivation', async function (req, res, next) {
    const {account} = req.body;
    const result = await getActivationAndReturn(account)
    console.log(result)
    res.json(result)
})


// 激活状态
router.post('/v1/setActivation', async function (req, res, next) {
    const {account} = req.body;
    const unit_id = req.cookies.unit_id
    const result = await setActivationAndReturn(account, unit_id);
    res.json(result);
});

router.post('/v1/batchImportUser', async (req, res, next) => {
    const {imported_array} = req.body;
    const unit_id = req.cookies.unit_id;
    const data = await addUserBatchingAndReturnList(imported_array, unit_id);
    setStatusCode(res, data);
    res.status(200).json(data);
})

module.exports = router;
