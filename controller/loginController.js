const {
    authenticate
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
        return new SuccessModel({ msg: data[1].message || data.message, data: data });
    } catch (e) {
        return new ErrorModel({ msg: e.message })
    }

};

module.exports = {
    postLogin
}
