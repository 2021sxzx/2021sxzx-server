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
            if (password == res.password) {

                const token = jwt.sign({
                    account: res.account,
                }, process.env.JWT_SECRET || 'test', {
                    expiresIn: "1h"
                });

                let res2 = [
                    {
                        expires: new Date(Date.now() + 900),
                        secure: false,
                        httpOnly: true
                    },
                    {
                        message: 'You have successfully logged in!',
                        token: token,
                        expiresIn: 3600
                    }
                ]
                /*res.cookie('auth-token', token, {
                    expires: new Date(Date.now() + 900),
                    secure: false,
                    httpOnly: true
                });
                res.json({
                    message: 'You have successfully logged in!',
                    token: token,
                    expiresIn: 3600
                });*/
                return res2;

            } else {
                return ({ message: 'Password is incorrect.' });
            }
        } else {
            return ({ message: 'You do not have an account yet. Please register.' });
        }

    } catch (e) {
        return e.message;
    }
}


module.exports = {
    authenticate
}
