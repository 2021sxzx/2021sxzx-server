const user = require('../model/users');
const jwt = require('jsonwebtoken');


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
            if (password === res.password) {
                if (res.activation_status !== 1) {
                    return ({ message: '该号码未被激活，请重试.', code: 403 });
                }
                const token = jwt.sign({
                    account: res.account,
                    user_rank: res.user_rank
                }, process.env.JWT_SECRET || 'test', {
                    expiresIn: "1h"
                });

                return {
                    message: 'You have successfully logged in!',
                    code: 200,
                    cookie: {
                        expires: new Date(Date.now() + 900),
                        secure: false,
                        httpOnly: true
                    },
                    jwt: {
                        token: token,
                        expiresIn: 3600
                    },
                    role_name: res.role_name
                };

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


module.exports = {
    authenticate
}
