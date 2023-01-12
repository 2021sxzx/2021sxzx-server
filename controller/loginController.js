const {
    authenticatebypwd,
    authenticatebyvc,
    logout,
    isLogin,
    whetherLockAccount,
    sendvc
} = require("../service/loginService")
const {SuccessModel, ErrorModel} = require('../utils/resultModel');

/**
 * 登陆的身份验证
 * @param loginData 其中包括用户账号和密码
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
async function postLogin(loginData) {
    try {
        let lockTime = await whetherLockAccount(loginData);
        if(lockTime > 0 ) {
            console.log("账号已经锁定")
            return { msg: "账号已锁定，请等待" + lockTime / 1000 + "秒再尝试.", code: 403 };
        }

        let data;
        if (loginData.state === 1)
            // 短信验证登录
            data = await authenticatebyvc(loginData)
        else
            // 账号密码登录
            data = await authenticatebypwd(loginData)
        return data
    } catch (e) {
        return new ErrorModel({msg: e.message});
    }
}

/**
 * 登出
 * @param logoutData 其中包括用户账号
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
async function postLogout(logoutData) {

    try {
        let data = await logout(logoutData);
        return new SuccessModel({msg: '登出成功', data: data});
    } catch (e) {
        return new ErrorModel({msg: e.message});
    }
}

async function JudgeIsLogin(token) {
    try {
        const res = await isLogin(token);
        return new SuccessModel({
            msg: "判断结果为data的boolean值", data: {
                isLogin: res
            }
        })
    } catch (err) {
        return err
    }
}

async function postSendVC(loginData) {
    try {
        const res = await sendvc(loginData);
        if(res == 0)
            return new SuccessModel({
                msg: "验证码发送成功",
                data: {},
            });
        else
            return {
                msg: "验证码发送失败",
                data: {},
            };
    } catch (err) {
        return err;
    }
}


module.exports = {
    postLogin,
    postLogout,
    postSendVC,
    JudgeIsLogin
}
