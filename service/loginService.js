const User = require('../model/users')
const jwt = require('jsonwebtoken')
const {
    jwt_secret, jwt_refresh_expiration, generate_refresh_token,
} = require('../utils/validateJwt')
// const axios = require("axios")
// import axios from "axios";
const redisClient = require('../config/redis')
const request = require("request");

/**
 * 验证用户身份、生成jwt
 * @returns {Promise<*>}
 * @param db
 */
async function selectRedisDatabase(db) {
    try {
        await redisClient.select(db)
    } catch (error) {
        await selectRedisDatabase(db)
    }
}

async function lockAccount(account) {
    await selectRedisDatabase(2)
    let redis_res = await redisClient.get(account)
    
    console.log("res", redis_res);
    if (redis_res == null || JSON.parse(redis_res).hasOwnProperty("loginFailTimes") == false) {
        // 第一次错误
        console.log(account, "第一次错误")
        await redisClient.set(
            account,
            JSON.stringify({
                loginFailTimes: 1,
                expires: new Date(),
            }),
            redisClient.print
        );

    } else if (JSON.parse(redis_res).loginFailTimes < 4) {
        // 后面几次错误
        console.log(account, JSON.parse(redis_res).loginFailTimes + 1);
        await redisClient.set(
            account,
            JSON.stringify({
                loginFailTimes: JSON.parse(redis_res).loginFailTimes + 1,
                expires: new Date(),
            }),
            redisClient.print
        );
    } else {
        // 第五次错误，锁定五分钟
        console.log(account, "锁定");
        await redisClient.set(
            account,
            JSON.stringify({
                loginFailTimes: 0,
                expires: new Date(new Date().valueOf() + 5 * 60 * 1000),
            }),
            redisClient.print
        );
    }
}

/**
 * 登录授权
 * @param loginData
 * @returns {Promise<{msg: string, code: number, data: {refresh_token: string, cookie: {httpOnly: boolean}, role_id: *, jwt: {expiresIn: number, token: (*)}, _id: *, unit_id: *, account: *}}|{code: number, message: string}|{msg: string, code: number}|*>}
 */
async function authenticatebypwd(loginData) {
    /**
     * @property res - 数据库中返回的帐户信息
     * @property res.account - 帐户帐号
     * @property res.password - 帐户密码
     * @property res.activation_status - 帐户激活状态
     * @property res.role_id
     * @property res.unit_id
     * @property res._id
     */
    try {
        const {account, password} = loginData
        let res = await User.findOne({account: account})
        // 错误检查
        if (res === null) return { msg: "密码错误，请重试.", code: 403 };
        if (password !== res.password) {
            await lockAccount(res.account)
            return {msg: '密码错误，请重试.', code: 403}
        }

        if (res.activation_status !== 1) return {msg: '该号码未被激活，请重试.', code: 403}
        
        await redisClient.set(
            res.account,
            JSON.stringify({
                loginFailTimes: 0,
                expires: new Date(),
            }),
            redisClient.print
        );

        // 检查最后修改密码的时间，如果时间不存在，就将本次登录的时间设置为最后修改密码的时间。
        // 如果时间存在，就判断该事件到本次登录的时间是否超过3个月。
        // 如果超过 3 个月就拒绝登录，提示用户使用短信登录后进入个人中心修改密码后再使用密码登录功能
        if (res._doc.password_modify_date) {
            // 如果最后修改密码的时间存在，检查距离上次修改密码的时间是否超过3个月
            // 当前时间
            const nowDate = new Date()
            // 距离上次修改密码的时间差
            const diff = Math.floor((nowDate - res._doc.password_modify_date) / (24 * 3600 * 1000))
            // 如果时间差大于 90 天就拒绝登录，否则就让正常登录
            if (diff > 90) {
                return {
                    msg: '该账号已经超过90天未修改密码，请先修改密码后再使用账号密码登录。' +
                        '如果要修改密码，请先使用手机验证码登录，然后进入个人中心修改密码。',
                    code: 403
                }
            }
        } else {
            // 如果最后修改密码的时间不存在，就把本次登录是时间作为最后修改密码的时间。
            await User.updateOne(
                {account: account},
                {password_modify_date: new Date()},
            )
        }

        // 通过错误检查
        let refresh_token = generate_refresh_token(64)
        let refresh_token_max_age = new Date(new Date().valueOf() + jwt_refresh_expiration)
        const token = jwt.sign({account: res.account}, jwt_secret, null, null)
        // 切换 redis 数据库至 db1
        await selectRedisDatabase(1)
        // 将 refresh_token 保存在 redis 中
        await redisClient.set(res.account, JSON.stringify({
            refresh_token: refresh_token, expires: refresh_token_max_age, token: token
        }), redisClient.print)
        await selectRedisDatabase(0)
        return {
            msg: 'You have successfully logged in!',
            code: 200,
            data: {
                cookie: {
                    httpOnly: true
                }, jwt: {
                    token, expiresIn: 3600
                }, role_id: res.role_id, unit_id: res.unit_id, account: res.account, _id: res._id, refresh_token
            }
        }
    } catch (e) {
        console.log(e)
        return {
            code: 500,
            msg: e.message
        }
    }
}


/**
 * 登录失败处理，等待5s才允许继续访问
 * @param loginData
 * @returns {Promise<number>}
 */
async function whetherLockAccount(loginData) {
    try {
        const { account, password } = loginData;
        // 账号
        await selectRedisDatabase(2);
        let res = JSON.parse(await redisClient.get(account));
        if (res !== null && new Date() <= new Date(res.expires)) 
            return new Date(res.expires).valueOf() - new Date().valueOf();
        
        // 手机
        await selectRedisDatabase(3);
        res = JSON.parse(await redisClient.get(account));
        if (res !== null && new Date() <= new Date(res.expires))
            return new Date(res.expires).valueOf() - new Date().valueOf();
        
        return 0
    } catch (e) {
        console.log(e.message)
        return e.message;
    }
}

// 发送验证码
async function sendvc(loginData) {
    /**
     * @property loginData.account - 帐户帐号
     */
    try {
        let account = loginData.account;
        // 仅作为参考
        var Rand = Math.random();
        var verificationCode = Math.round(Rand * 100000000);
        
        options = {
            url: 'http://10.147.25.152:8082/sms/v2/std/send_single',
            form: {
                userid: 'ZNZXPT', //字符串
                pwd: 'ZNZXPT@#2022',
                mobile: account, //字符串
                content: '验证码：' + verificationCode + ',请妥善保管。',
            }
        }

        await selectRedisDatabase(3);
        request.post(options, function (err, res, body) {
            if (err) {
                console.log("发送验证码失败", err);
                return -1
            } 

            redisClient.set(
                account,
                JSON.stringify({
                    verificationCode: verificationCode,
                    expires: new Date() + jwt_refresh_expiration,
                }),
                redisClient.print
            );

            // console.dir(JSON.parse(body).result)
            // console.dir(res)
        });
        // let res = {
        //     "result": 0
        // };
        // verificationCode = "12345678"

        console.log("验证码已经发送")
        return 0
    } catch (e) {
        return e.message;
    }

}


//验证码登录
async function authenticatebyvc(loginData) {
    /**
     * @property res - 数据库中返回的帐户信息
     * @property res.account - 帐户帐号
     * @property res.password - 帐户密码
     * @property res.activation_status - 帐户激活状态
     * @property res.role_id
     * @property res.unit_id
     * @property res._id
     */
    try {
        const {account, verificationCode} = loginData
        let res = await User.findOne({account: account})
        // 错误检查
        console.log(res)
        if (res === null) return {msg: '验证码错误', code: 403}
        if (res.activation_status !== 1) return {message: '该号码未被激活，请重试.', code: 403}
        // 验证码检测
        selectRedisDatabase(3)
        let redis_res = await redisClient.get(account)
        
        if (new Date(redis_res.expires).valueOf() < new Date().valueOf()) {
            return { msg: "验证码错误", code: 403 };
        }
        
        if (verificationCode != JSON.parse(redis_res).verificationCode) {
            await lockAccount(account);
            return { msg: "验证码错误", code: 403 };
        }
        // 通过验证码检测
        let refresh_token = generate_refresh_token(64)
        let refresh_token_max_age = new Date(new Date().valueOf() + jwt_refresh_expiration)
        const token = jwt.sign({account: res.account}, jwt_secret, null, null)
        // 切换 redis 数据库至 db1
        await selectRedisDatabase(1)
        // 将 refresh_token 保存在 redis 中
        await redisClient.set(res.account, JSON.stringify({
            refresh_token: refresh_token, expires: refresh_token_max_age, token: token
        }), redisClient.print)
        await selectRedisDatabase(0)
        return {
            msg: 'You have successfully logged in!', code: 200, data: {
                cookie: {
                    httpOnly: true
                }, jwt: {
                    token, expiresIn: 3600
                }, role_id: res.role_id, unit_id: res.unit_id, account: res.account, _id: res._id, refresh_token
            }
        }
    } catch (e) {
        return e.message
    }
}


/**
 * 登出
 * @param logoutData
 * @returns {Promise<number>}
 */
async function logout(logoutData) {
    await selectRedisDatabase(1)
    try {
        let res = await redisClient.del(logoutData.account)
        await selectRedisDatabase(0)
        return res
    } catch (e) {
        await selectRedisDatabase(0)
        throw new Error(e.message)
    }
}

/**
 * 判断是否达到免密登录标准，过期时间为600s
 * @param token 客户端的 token，保存登录账号等信息
 * @returns {Promise<boolean>} 免密登录是否有效
 */
async function isLogin(token) {
    await selectRedisDatabase(1)
    const account = await jwt.verify(token, jwt_secret, null, null).account

    // 判断当前时间是否小于数据库中的过期时间
    if (new Date() < new Date(JSON.parse(await redisClient.get(account)).expires)) {
        // 未过期，将 redis 刷新一下
        await redisClient.set(account, JSON.stringify({
            refresh_token: generate_refresh_token(64),
            expires: new Date(new Date().valueOf() + jwt_refresh_expiration),
            token
        }), redisClient.print)
        await selectRedisDatabase(0)
        return true
    } else {
        await selectRedisDatabase(1)
        // 已过期，数据用于在 router 层中做删除 cookie 的标识
        await redisClient.del(account)
        await selectRedisDatabase(0)
        return false
    }
}

module.exports = {
    authenticatebypwd,
    authenticatebyvc,
    logout,
    isLogin,
    whetherLockAccount,
    sendvc,
};
