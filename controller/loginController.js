const {
  authenticate, logout, isLogin
} = require("../service/loginService")
const {SuccessModel, ErrorModel} = require('../utils/resultModel');

/**
 * 登陆的身份验证
 * @param loginData 其中包括用户账号和密码
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
async function postLogin(loginData) {
  try {
    let data = await authenticate(loginData)
    if (data.code === 200) {
      return new SuccessModel(data);
    } else {
      return new ErrorModel(data)
    }
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

module.exports = {
  postLogin, postLogout, JudgeIsLogin
}
