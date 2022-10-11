const express = require('express');
const router = express.Router();
const modelUsers = require('../model/users')
const personalController = require('../controller/personalController');
const {ErrorModel} = require('../utils/resultModel');
const {shouldUpdatePasswordModifyDate} = require('../service/userManagementService.js')

function wrap(handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (e) {
            throw new ErrorModel({
                msg: "个人信息处理失败",
                data: e.message
            });
        }
    };
}

router.get('/v1/personal', wrap(personalController.getTopBarData));
// 新增的发送验证码
router.post('/v2/modifyPwd', async (req, res) => {
    const account = req.body.account
    const password = req.body.pwd

    // 如果密码改变了，就更新最后修改密码的时间戳。
    let isPasswordChange = await shouldUpdatePasswordModifyDate(account, password)

    // 如果密码和上一个一样，提示修改失败
    if (isPasswordChange === false) {
        res.status(403).json({
            msg: '由于安全性要求，新密码不能与旧密码相同，请重新修改。'
        })
    }

    modelUsers.updateOne({
        account: account
    }, {
        password: password
    }, function (err, res) {
        if (err) {
            res.status(500).json({
                msg: '更新用户信息失败',
            })
        }

    })

    res.end()
})

module.exports = router;
