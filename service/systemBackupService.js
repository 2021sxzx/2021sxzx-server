// const systemFailure = require("../model/systemFailure");
const fs = require('fs');
/**
 * 返回全部系统故障记录的接口
 * @returns {Promise<*|*>}
 */
 async function getMongoFile() {
  try {
    var data = fs.readFileSync('log/MongoDB_bak.sh');
    console.log(Object.prototype.toString.call(data))
    // console.log(data)
    var dataString = "";
    for (var i = 0; i < data.length; i++) {
        dataString += String.fromCharCode(data[i]);
    }
    console.log('dataString')
    console.log(dataString)
    // return res;
  } catch (e) {
    return e.message;
  }
}

module.exports = {
    getMongoFile
};
