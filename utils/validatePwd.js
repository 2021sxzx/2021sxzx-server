// 验证密码
const validatePwd = (pwd) => {

  const reg =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*_\-+=])[\w\d@#$%&*_\-+=]*$/;
  const result = reg.test(pwd);
  return result
}

module.exports = {
  validatePwd
};