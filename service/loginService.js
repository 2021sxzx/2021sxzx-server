const user = require('../model/users');
const jwt = require('jsonwebtoken');

const { jwt_secret,
    jwt_expiration,
    jwt_refresh_expiration,
    generate_refresh_token,
} = require('../utils/validateJwt');

const redisClient = require('../config/redis')


/**
 * 验证用户身份、生成jwt
 * @param loginData
 * @returns {Promise<*>}
 */
async function authenticate(loginData) {
    try {
        const { account, password } = loginData
        let res = await user.findOne({ account: account })
        if (res !== null) {
            // Compare password
            if (password == res.password) {

                let refresh_token = generate_refresh_token(64);

                let refresh_token_maxage = new Date() + jwt_refresh_expiration;

                const token = jwt.sign({
                    account: res.account,
                }, jwt_secret, {
                    expiresIn: jwt_expiration
                });

                // 将refresh_token保存在redis中
                redisClient.set(res.account, JSON.stringify({
                    refresh_token: refresh_token,
                    expires: refresh_token_maxage
                }),
                    redisClient.print
                );


                let response = {
                    message: 'You have successfully logged in!',
                    code: 200,
                    role_name: res.role_name,
                    cookie: {
                        httpOnly: true
                    },
                    jwt: {
                        token: token,
                        expiresIn: 3600
                    },
                    refresh_token
                }

                return response;

            } else {
                return ({ message: '密码错误，请重试.', code: 403 });
            }
        } else {
            return ({ message: '该账号不存在.', code: 403 });
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



module.exports = {
    authenticate,
    logout
}
