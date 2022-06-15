const User = require('../model/users');
const jwt = require('jsonwebtoken');

const { 
  jwt_secret,
  jwt_expiration,
  jwt_refresh_expiration,
  generate_refresh_token,
} = require('../utils/validateJwt');

const redisClient = require('../config/redis')
const { SuccessModel, ErrorModel } = require('../utils/resultModel');

/**
 * 验证用户身份、生成jwt
 * @param loginData
 * @returns {Promise<*>}
 */
async function authenticate(loginData) {
    try {
        const { account, password } = loginData;
        let res = await User.findOne({ account: account });
        if (res !== null) {
            // Compare password
            if (password === res.password) {
                if (res.activation_status !== 1) {
                    return ({ message: '该号码未被激活，请重试.', code: 403 });
                }

                let refresh_token = generate_refresh_token(64);
                const maxage = new Date().valueOf();
                let refresh_token_maxage = new Date(maxage + jwt_refresh_expiration);

                const token = jwt.sign({
                    account: res.account,
                }, jwt_secret, {
                    expiresIn: jwt_expiration
                });


                // 将refresh_token保存在redis中
                await redisClient.set(res.account, JSON.stringify({
                    refresh_token: refresh_token,
                    expires: refresh_token_maxage,
                    token: token
                }),
                    redisClient.print
                );

                return ({
                    msg: 'You have successfully logged in!',
                    code: 200,
                    data: {
                      cookie: {
                        httpOnly: true
                      },
                      jwt: {
                          token: token,
                          expiresIn: 3600
                      },
                      role_id: res.role_id,
                      unit_id: res.unit_id,
                      account: res.account,
                      _id: res._id,
                      refresh_token
                    }
                });
            } else {
                return ({ msg: '密码错误，请重试.', code: 403 });
            }
        } else {
            return ({ msg: '该账号不存在.', code: 403 });
        }

    } catch (e) {
        return e.message;
    }
}

/**
 * 登出
 * @param logoutData
 * @returns {Promise<EnforceDocument<unknown, {}>[]>}
 */
async function logout(logoutData) {
    try {
        let res = await redisClient.del(logoutData.account);
        return res;
    } catch (e) {
        throw new Error(e.message)
    }
}

// 判断是否达到免密登录标准
// 如果redis的token过期了，那么就代表免密登录失败
// 过期时间为600s
async function isLogin (token) {
  const maxage = new Date().valueOf();
  let refresh_token_maxage = new Date(maxage + jwt_refresh_expiration);
  let refresh_token = generate_refresh_token(64);
  try {
    const jw = await jwt.verify(token, jwt_secret);
    const account = jw.account;

    const thisTime = new Date();
    let redisData = await redisClient.get(account);

    if (thisTime < new Date(JSON.parse(redisData).expires)) {
      // 未过期，将redis刷新一下，重新生成一下token并放到cookie
      const newToken = jwt.sign({
        account: account
      }, jwt_secret, {
        expiresIn: jwt_expiration
      });
      redisClient.set(account, JSON.stringify({
        refresh_token: refresh_token,
        expires: refresh_token_maxage,
        token: newToken
      }), redisClient.print);
      return true;
    } else {
      // 已过期，数据用于在router层中做删除cookie的标识
      await redisClient.del(account);
      return false;
    }
  } catch (err) {
    // 这里判断是否过期
    return false;
    // if(err.name == 'TokenExpiredError'){//token过期
    //   return false;
    // } else if (err.name == 'JsonWebTokenError'){//无效的token
    //   let str = {
    //     iat: 1,
    //     exp: 0,
    //     msg: '无效的token'
    //   }
    //   return false;
    // }
  }
}

module.exports = {
    authenticate,
    logout,
    isLogin
}
