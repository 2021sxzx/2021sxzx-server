// 验证密码
const validatePwd = (pwd) => {

  const reg =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*_\-+=])[\w\d@#$%&*_\-+=]*$/;
  return reg.test(pwd)
}

module.exports = {
  validatePwd
};
