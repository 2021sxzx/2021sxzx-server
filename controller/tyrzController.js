// tyrzController.js 省统一身份认证接口相关 controller

// 导入依赖
const service = require('../service/tyrzService')

// 各接口
async function getInfo(req) {
    try {
        return await service.getInfo(req)
    } catch (e) {
        console.log(e)
    }
}

async function loginByCode(req) {
    try {
        return await service.loginByCode(req)
    } catch (e) {
        console.log(e)
    }
}

async function logout(req) {
    try {
        await service.logout(req)
    } catch (e) {
        console.log(e)
    }
}

module.exports = {getInfo, loginByCode, logout}