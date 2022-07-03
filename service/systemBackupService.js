const systemConfiguration = require("../model/systemConfiguration");
const systemBackup = require("../model/systemBackup");
const user = require("../model/users");
const fs = require('fs');
const path=require('path')
var child = require("child_process");
var execFile = require("child_process").execFile;
const schedule = require('node-schedule')
const logger=require('morgan')

//系统启动时，就自动备份
var filePath = path.join(__dirname, "./MongoDBBak.sh");
var logPath = path.join(__dirname, "../log/access.log");
function getDate() {
  var date = new Date(new Date().getTime() + 8 * 3600 * 1000);
  return date.toISOString();
}
var cycle = '';
var checkJob = '';
getMongoBackupCycle().then(res => {
  cycle='0 0 */'+res+' * * *' //"*/10 * * * * *"
  checkJob = schedule.scheduleJob(cycle, function () {
    // 读脚本 sh + 脚本[绝对]路径 而且要加权限
    child.exec("sh " + filePath, function (err, stdout, stderr) {
      if (err) {
        const writeStream2 = fs.createWriteStream(logPath, { flags: "a" });
        let logString = "定时备份故障[" + getDate() + "]" + err + "\n";
        writeStream2.write(logString);
        writeStream2.end();
        return;
      }

        // 日志写记录：你备份了
        const writeStream = fs.createWriteStream(logPath, { flags: "a" });
        var backup_name = stdout.toString().split("\n");
        backup_name = backup_name[backup_name.length - 2];
        let logString = stdout+"::[" + getDate() + "] \"系统自动备份\" \n";
        createSystemBackup(backup_name,"系统");
        writeStream.write(logString);
        writeStream.end();
    });
  });
})


/**
 * 返回系统备份周期
 * @returns {Promise<*|*>}
 */
 async function getMongoBackupCycle() {
  try {
    var data = await systemConfiguration.findOne({'name': 'backup_cycle'})
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
    var data=await systemBackup.find();
    return data;
  } catch (e) {
    return e.message;
  }
}

/**
 * 创建系统备份
 * @returns {Promise<*|*>}
 */
 async function createSystemBackup(backup_name,user_name) {
  try {
    /* if (data.failureName === null) {
      throw new Error("call createSystemFailure error: failure_name is null");
    } */
      return await systemBackup.create({
      backup_name: backup_name,
      user_name: user_name
    });
    var data=await systemBackup.find();
    console.log(data)
    // return data;
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
        await systemConfiguration.updateOne({name:'backup_cycle'},{
          $set: {configuration:{cycle:data.time}}
        })
        getMongoBackupCycle().then(res =>{
          cycle='*/'+res+' * * * * *' //"*/10 * * * * *"
          checkJob.reschedule(cycle)
        })
        var config = await systemConfiguration.findOne({'name': 'backup_cycle'});
        return 'success'
    } catch (e) {
        return e.message;
    }
}



/**
 * 定时系统备份（这个函数可能不会用上）
 * @returns {Promise<*|*>}
 */
 async function autoBackup() {
   try {
     var filePath = path.join(__dirname, "./MongoDBBak.sh");
     var logPath = path.join(__dirname, "../log/access.log");
     function getDate() {
       var date = new Date(new Date().getTime() + 8 * 3600 * 1000);
       return date.toISOString();
     }
    var cycle=''
    await getMongoBackupCycle().then(res =>cycle=res)
    cycle='*/'+cycle+' * * * * *' //"*/10 * * * * *"
     var checkJob = schedule.scheduleJob(cycle, function () {
       child.exec("sh " + filePath, function (err, stdout, stderr) {
         if (err) {
           console.log(err);
           const writeStream2 = fs.createWriteStream(logPath, { flags: "a" });
           let logString = "定时备份故障[" + getDate() + "]" + err + "\n";
           writeStream2.write(logString);
           writeStream2.end();
           return 0;
         }
           const writeStream = fs.createWriteStream(logPath, { flags: "a" });
           var backup_name = stdout.toString().split("\n");
           backup_name = backup_name[backup_name.length - 2];
           let logString = "系统 ::[" + getDate() + "] \"系统自动备份\" \n";
           createSystemBackup(backup_name,"系统");
           writeStream.write(logString);
           writeStream.end();
       });
     });
   } catch (e) {
     return e.message;
   }
 }
// autoBackup()

/**
 * 手动系统备份
 * @returns {Promise<*|*>}
 */
 async function handleBackup(user_id) {
   try {
     var filePath = path.join(__dirname, "./MongoDBBak.sh");
     var logPath = path.join(__dirname, "../log/access.log");
     function getDate() {
      var date = new Date(new Date().getTime() + 8 * 3600 * 1000);
      return date.toISOString();
    }
       child.exec("sh " + filePath,async function (err, stdout, stderr) {
       if (err) {
         const writeStream2 = fs.createWriteStream(logPath, { flags: "a" });
         let logString = "手动备份故障[" + getDate() + "]" + err + "\n";
         writeStream2.write(logString);
         writeStream2.end();
         return 0;
       }
      const writeStream1 = fs.createWriteStream(logPath, { flags: "a" });
         var backup_name = stdout.toString().split("\n");
         backup_name = backup_name[backup_name.length - 2];
         var backup_user=await user.findOne({_id:user_id});
         let logString = backup_name+"|||"+backup_user.user_name+" ::[" + getDate() + "] \"手动系统备份完成\" \n";
         createSystemBackup(backup_name,backup_user.user_name);
       writeStream1.write(logString);
       writeStream1.end();
     });
} catch (e) {
     return e.message;
   }
 }

module.exports = {
    getMongoBackupCycle,
    changeBackupCycleService,
    handleBackup,
    getSystemBackup,
    createSystemBackup
};