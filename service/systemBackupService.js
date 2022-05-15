const systemConfiguration = require("../model/systemConfiguration");
const fs = require('fs');
const path=require('path')
var child = require("child_process");
var execFile = require("child_process").execFile;
const schedule = require('node-schedule')
const logger=require('morgan')
/**
 * 返回系统备份周期
 * @returns {Promise<*|*>}
 */
 async function getMongoBackupCycle() {
  try {
    var data=await systemConfiguration.findOne({'name':'backup_cycle'})
    // console.log(data.configuration.cycle)
    return data.configuration.cycle;
    // console.log(data)
    /* var data = fs.readFileSync('log/MongoDB_bak.sh');
    console.log(Object.prototype.toString.call(data))
    // console.log(data)
    var dataString = "";
    for (var i = 0; i < data.length; i++) {
        dataString += String.fromCharCode(data[i]);
    }
    console.log('dataString')
    console.log(dataString) */
    // return res;
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
        console.log(data.time);
        await systemConfiguration.updateOne({'name':'backup_cycle'},{
            _id:_id,
            name:name,
            configuration:{cycle:data.time},
        })
        var config = await systemConfiguration.findOne({'name': 'backup_cycle'});
        console.log("config:");
        console.log(config);
    } catch (e) {
        return e.message;
    }
}



/**
 * 定时系统备份
 * @returns {Promise<*|*>}
 */
 async function autoBackup() {
  try {
    var checkJob = schedule.scheduleJob('*/10 * * * * *', function () {
      /*       child.exec('sh MongoDB_bak.sh',function(err,stdout,stderr){
        if(err){console.log(err)}
        console.log("stdout:",stdout)
        // console.log("stderr:",stderr);
      }) */

      var logPath = path.join(__dirname, "../log/access.log");
      console.log(logPath)
      const writeStream = fs.createWriteStream(logPath, { flags: "a" });

/*       logger.token('id',function getId(){return '系统'});
      logger.token('localDate',function getDate(){
        var date=new Date(new Date().getTime()+8 * 3600 * 1000);
        return date.toISOString()
      });
      logger(':id [:localDate]', {
        stream: writeStream
      }) */


       //读取文件发生错误事件
      writeStream.on("error", (err) => {
        console.log("发生异常:", err);
      });
      //已打开要写入的文件事件
      writeStream.on("open", (fd) => {
        console.log("文件已打开:");
      });
      function getDate(){
        var date=new Date(new Date().getTime()+8 * 3600 * 1000);
        return date.toISOString()
      }
      let logString="系统["+getDate()+"]备份\n"
      writeStream.write(logString);
      writeStream.end();
      //文件已经就写入完成事件
      writeStream.on("finish", () => {
        console.log("写入已完成..");
        // console.log("读取文件内容:", fs.readFileSync(logPath, "utf8")); //打印写入的内容
        // console.log(writeStream);
      });
      //文件关闭事件
      writeStream.on("close", () => {
        console.log("文件已关闭！");
      });
      /*       let data = new Promise(function (resolve, reject) {
        var cmd = "node -v"; //监听80端口拿进程数
        child.exec(cmd, function (err, stdout, stderr) {
          if (err) {
            console.log(err);
            reject(err);
          } else if (stderr.length > 0) {
            reject(new Error(stderr.toString()));
          } else {
            // a=stdout;
            console.log("stdout:", stdout);
            resolve();
          }
        });
      }); */
    })


/*     execFile("ping",["www.baidu.com"],function(err,stdout,stderr){
      if(err){console.log(err)}
      console.log("stdout:",stdout)
      console.log("stderr:",stderr);
    }) */
/*     execFile("cmd",["node -v"],function(err,stdout,stderr){
      if(err){console.log(err)}
      console.log("stdout:",stdout)
      console.log("stderr:",stderr);
    }) */
    /* child.exec('ls',function(err,stdout,stderr){
      if(err){console.log(err)}
      console.log("stdout:",stdout)
      console.log("stderr:",stderr);
    }) */
  } catch (e) {
    return e.message;
  }
}
// autoBackup()
module.exports = {
  getMongoBackupCycle,
    changeBackupCycleService
};
