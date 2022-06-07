// 验证密码
const validatePwd = (pwd) => {

  const reg =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*_+-=]){8,16}$/;
  const result = reg.test(pwd);
  return result
}

module.exports = {
  validatePwd
};