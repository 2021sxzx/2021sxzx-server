const User = require('../model/users')
const jwt = require('jsonwebtoken')
const {
  jwt_secret, jwt_refresh_expiration, generate_refresh_token,
} = require('../utils/validateJwt')

const redisClient = require('../config/redis')

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

/**
 * 登录授权
 * @param loginData
 * @returns {Promise<{msg: string, code: number, data: {refresh_token: string, cookie: {httpOnly: boolean}, role_id: *, jwt: {expiresIn: number, token: (*)}, _id: *, unit_id: *, account: *}}|{code: number, message: string}|{msg: string, code: number}|*>}
 */
async function authenticate(loginData) {
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
    if (res === null) return {msg: '该账号不存在.', code: 403}
    if (password !== res.password) return {msg: '密码错误，请重试.', code: 403}
    if (res.activation_status !== 1) return {message: '该号码未被激活，请重试.', code: 403}
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
      refresh_token: generate_refresh_token(64), expires: new Date(new Date().valueOf() + jwt_refresh_expiration), token
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
  authenticate, logout, isLogin
}
