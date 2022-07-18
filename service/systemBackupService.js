const systemConfiguration = require("../model/systemConfiguration");
const systemBackup = require("../model/systemBackup");
const user = require("../model/users");
const fs = require('fs');
const path = require('path')
const child = require("child_process");

//系统启动时，就自动备份
const filePath = path.join(__dirname, "./MongoDBBak.sh");
const logPath = path.join(__dirname, "../log/access.log");

function getDate() {
  const date = new Date(new Date().getTime() + 8 * 3600 * 1000);
  return date.toISOString();
}

/**
 * 定时备份方法
 */
function autoBackup() {
  child.exec("sh " + filePath, function (err, stdout) {
    if (err) {
      console.log(err);
      const writeStream2 = fs.createWriteStream(logPath, {flags: "a"});
      let logString = "定时备份故障[" + getDate() + "]" + err + "\n";
      writeStream2.write(logString);
      writeStream2.end();
      return 0;
    }
    const writeStream = fs.createWriteStream(logPath, {flags: "a"});
    let backup_name = stdout.toString().split("\n");
    backup_name = backup_name[backup_name.length - 2];
    let logString = "系统 ::[" + getDate() + "] \"系统自动备份\" \n";
    createSystemBackup(backup_name, "系统").then();
    writeStream.write(logString);
    writeStream.end();
  });
}

// 启动定时器执行自动备份
let backupCycle;
getMongoBackupCycle().then(res => {
  backupCycle = setInterval(autoBackup, res * 86400000);
})

/**
 * 返回系统备份周期
 * @returns {Promise<*|*>}
 */
async function getMongoBackupCycle() {
  /** @property data.configuration */
  try {
    const data = await systemConfiguration.findOne({'name': 'backup_cycle'});
    return data.configuration.cycle;
  } catch (e) {
    return e.message;
  }
}

/**
 * 返回系统备份
 * @returns {Promise<*|*>}
 */
async function getSystemBackup() {
  try {
    let data = await systemBackup.find();
    let test = JSON.parse(JSON.stringify(data));
    for (let i in test) {
      try {
        test[i]['file_size'] = fs.statSync(test[i]['backup_name']).size;
      } catch (e) {
        test[i]['file_size'] = e.message;
      }
    }
    return test;
  } catch (e) {
    return e.message;
  }
}

/**
 * 创建系统备份
 * @returns {Promise<*|*>}
 */
async function createSystemBackup(backup_name, user_name) {
  try {
    return await systemBackup.create({
      backup_name: backup_name, user_name: user_name
    });
  } catch (e) {
    return e.message;
  }
}

/**
 * 修改系统备份周期
 * @returns {Promise<*|*>}
 */
async function changeBackupCycleService(data) {
  try {
    await systemConfiguration.updateOne({name: 'backup_cycle'}, {
      $set: {configuration: {cycle: data.time}}
    })
    // 修改备份后重置定时器
    clearInterval(backupCycle);
    getMongoBackupCycle().then(res => {
      backupCycle = setInterval(autoBackup, res * 86400000);
    })
    await systemConfiguration.findOne({'name': 'backup_cycle'});
    return 'success'
  } catch (e) {
    return e.message;
  }
}

/**
 * 手动系统备份
 * @returns {Promise<*|*>}
 */
async function handleBackup(user_id) {
  /** @property backup_user.user_name */
  try {
    const filePath = path.join(__dirname, "./MongoDBBak.sh");
    const logPath = path.join(__dirname, "../log/access.log");

    function getDate() {
      const date = new Date(new Date().getTime() + 8 * 3600 * 1000);
      return date.toISOString();
    }

    // 在 windows 下测试，sh 命令是不可用的
    child.exec("sh " + filePath, async function (err, stdout) {
      console.log('执行备份命令脚本的回调函数开始执行'); // todo debug
      if (err) {
        console.log(err); // todo debug
        const writeStream2 = fs.createWriteStream(logPath, {flags: "a"});
        let logString = "手动备份故障[" + getDate() + "]" + err + "\n";
        writeStream2.write(logString);
        writeStream2.end();
        return 0;
      }
      const writeStream1 = fs.createWriteStream(logPath, {flags: "a"});
      let backup_name = stdout.toString().split("\n");
      backup_name = backup_name[backup_name.length - 2];
      const backup_user = await user.findOne({_id: user_id});
      let logString = backup_name + "|||" + backup_user.user_name + " ::[" + getDate() + "] \"手动系统备份完成\" \n";
      await createSystemBackup(backup_name, backup_user.user_name);
      writeStream1.write(logString);
      writeStream1.end();
    });
  } catch (e) {
    return e.message;
  }
}

module.exports = {
  getMongoBackupCycle, changeBackupCycleService, handleBackup, getSystemBackup, createSystemBackup
};