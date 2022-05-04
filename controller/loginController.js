const {
    authenticate,
    logout
} = require("../service/loginService")
const { SuccessModel, ErrorModel } = require('../utils/resultModel');

/**
 * 登陆的身份验证
 * @param loginData 其中包括用户账号和密码
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
async function postLogin(loginData) {

    try {
        let data = await authenticate(loginData)
        if (data.code == 200) {
            return new SuccessModel({ code: 200, msg: data.message, data: data });
        } else if (data.code == 403) {

            return new ErrorModel({ code: 403, msg: data.message })
        }
    } catch (e) {

        return new ErrorModel({ msg: e.message })
    }

};


/**
 * 登出
 * @param logoutData 其中包括用户账号
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
async function postLogout(logoutData) {

    try {
        let data = await logout(logoutData);
        return new SuccessModel({ msg: '登出成功', data: data });
    } catch (e) {
        return new ErrorModel({ msg: e.message })
    }
}

module.exports = {
    postLogin,
    postLogout
}
