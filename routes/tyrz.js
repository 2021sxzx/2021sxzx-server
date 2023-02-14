// tyrz.js 省统一身份认证接口相关路由

// 导入依赖
const router = require('express').Router()
const {getInfo, loginByCode, logout} = require('../controller/tyrzController')

// 各路由
router.get('/v1/get-info', async (req, res) => res.json(await getInfo(req)))
router.get('/v1/login-by-code', async (req, res) => {
    res.cookie('tyrz_identifier', await loginByCode(req))
    res.sendStatus(200)
})
router.get('/v1/logout-tyrz', async (req, res) => {
    await logout(req)
    res.clearCookie('tyrz_identifier')
    res.sendStatus(200)
})

module.exports = router