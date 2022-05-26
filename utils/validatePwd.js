// 验证密码
const validatePwd = (pwd) => {
  // 基础分：空密码(密码长度为零)0分，非空密码1分
  // 加分项：密码包含两类不同字符+1分，包含三类不同字符+2分，包含四类不同字符+3分
  if (pwd.length <= 8) {
    return false;
  }
  let scout = 0;
  let arr = pwd.split('').map(item => { return String(item) });
  let numberLock = 0;
  let upperCaseLock = 0;
  let lowerCaseLock = 0;
  let otherCaseLock = 0;
  for (let item of arr) {
    // 不允许空串
    if (item == ' ') {
      return false;
    }
    if (numberLock == 0) {
      if (item.charCodeAt() >= 48 && item.charCodeAt() <= 57) { // 判断数字
        scout++;
        numberLock = 1;
      }
    }
    if (upperCaseLock == 0) {
      if (item.charCodeAt() >= 65 && item.charCodeAt() <= 90) { // 判断大写
        scout++;
        upperCaseLock = 1;
      }
    }
    if (lowerCaseLock == 0) {
      if (item.charCodeAt() >= 97 && item.charCodeAt() <= 122) { // 判断小写
        scout++;
        lowerCaseLock = 1;
      }
    }
    if (otherCaseLock == 0) {
      if (!((item.charCodeAt() >= 48 && item.charCodeAt() <= 57) || (item.charCodeAt() >= 65 && item.charCodeAt() <= 90) || (item.charCodeAt() >= 97 && item.charCodeAt() <= 122))) { // 判断其他字符
        scout++;
        otherCaseLock = 1;
      }
    }
  }
  return scout >= 3 ? true : false;
}

module.exports = {
  validatePwd
};