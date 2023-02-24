// tyrzService.js 省统一身份认证接口相关 service

// 导入依赖
const redisClient = require('../config/redis')
const {TYRZ} = require('../config/config')
const request = require('request')
const jwt = require('jsonwebtoken')
const jwt_key = 'jwt secret for tyrz'

// 设置 redis 数据库，db4 用于该 service 相关操作，注意勿挪作他用
const f = async () => {
    while (true) try {
        await redisClient.select(4)
        break
    } catch (e) {
    }
}
f().then()

// 各接口
/**
 * 根据用户提供的 cookie 返回用户实名信息。
 * 成功时返回 code: 0，用户未登录返回 code: 1。
 * 现在暂定只返回脱敏姓名。
 * @param tyrz_identifier
 * @return {Promise<{code: number, name: string}|{code: number}>}
 */
async function getInfo({cookies: {tyrz_identifier}}) {
    /**
     * @property cn 姓名
     */
    // 根据 cookie 获取 redis 中的对应条目，此处只获取姓名
    if (tyrz_identifier) {
        const data = JSON.parse(await redisClient.get(tyrz_identifier))
        // 若条目存在
        if (data)
            // 返回脱敏姓名
            return {code: 0, name: `**${data.cn.slice(-1)}`}
    }
    // 条目或 cookie 不存在
    return {code: 1}
}

/**
 * 带 cookie 的用户要求以 code 登录。系统通过 code 取得用户数据后存入 redis 中。
 * @param tyrz_identifier cookie 中用于验证是否登录的字段
 * @param code
 * @return {Promise<*>} 返回 tyrz_identifier
 */
async function loginByCode({cookies: {tyrz_identifier}, query: {code}}) {
    /**
     * @property data.access_token - 接口返回的 access_token
     * @property data.errcode - 接口返回的错误码
     * @property data.userobj - 接口返回的用户信息
     */
    // 若 cookie 为空
    if (!tyrz_identifier) {
        do {
            tyrz_identifier = Math.random().toString(36).substring(2)
        } while (await redisClient.get(tyrz_identifier))
        // 随机生成一个 redis 中没有的新 cookie
    }
    // 获取 access_token
    
    // console.log(`${TYRZ.url}/pscp/sso/connect/page/oauth2/access_token/?client_id=${TYRZ.client_id}&client_secret=${TYRZ.client_secret}&code=${code}&scope=all&redirect_uri=${TYRZ.redirect_url}&grant_type=authorization_code`)
    
    request(`${TYRZ.url}/pscp/sso/connect/page/oauth2/access_token?client_id=${TYRZ.client_id}&client_secret=${TYRZ.client_secret}&code=${code}&scope=all&redirect_uri=${TYRZ.redirect_url}&grant_type=authorization_code`,
        (err, res, data) => {
            if (err) throw(err)
            const access_token = JSON.parse(data).access_token
            if (access_token)
                // 获取用户信息
                request(`${TYRZ.url}/pscp/sso/connect/page/oauth2/tokeninfo?access_token=${access_token}`, (err, res, data) => {
                    if (err) throw(err)
                    data = JSON.parse(data)
                    if (data.errcode) {
                        console.error('用户信息获取失败，错误信息')
                        console.error(data)
                    } else {
                        // 保存用户信息，整个 JSON 都会保存在 data 中
                        redisClient.set(tyrz_identifier, JSON.stringify(data.userobj)).then()
                    }
                })
            else {
                console.error('access_token 获取失败，错误信息')
                console.error(data)
            }
        })
    return tyrz_identifier
}

/**
 * 带 cookie 的用户要求登出。从 redis 中删除对应条目。
 * @param cookies
 */
async function logout({cookies: {tyrz_identifier}}) {
    if (tyrz_identifier)
        redisClient.del(tyrz_identifier).then()
}

module.exports = {getInfo, loginByCode, logout}