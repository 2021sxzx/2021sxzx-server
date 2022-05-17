const systemConfiguration = require("../model/systemConfiguration");
// const users = require("../model/users");
const fs = require("fs");
var osu = require("node-os-utils");
const si = require("systeminformation");
var cpu = osu.cpu;
var mem = osu.mem;
// const childProcess = require('child_process'); // nodeJS 自带
// const exec = childProcess.exec
"use strict";
var exec = require("child_process").exec;
const schedule = require('node-schedule')

/**
 * 获取中央处理器占用率
 * @returns {Promise<*|*>}
 */
async function getCpuPercentage() {
  try {
    let cpuPercentage = await new Promise((resolve, reject) => {
      cpu.usage().then((info) => {
        resolve(info);
      });
    });
    return cpuPercentage;
  } catch (e) {
    return e;
  }
}

/**
 * 获取内存信息
 * @returns {Promise<*|*>}
 */
async function getMemory() {
  try {
    let memory = await new Promise((resolve, reject) => {
      mem.info().then((info) => {
        resolve(info);
      });
    });
    return memory;
  } catch (e) {
    return e;
  }
}

/**
 * 获取磁盘信息
 * @returns {Promise<*|*>}
 */
async function getDisk() {
  try {
    let disk = await new Promise((resolve, reject) => {
      si.fsSize()
        .then((data) => {resolve(data);})
        .catch((error) => console.error(error));
    });
    return disk;
  } catch (e) {
    return e;
  }
}

//废弃版本1
async function viewProcessMessage1(){
  // process 不用引入，nodeJS 自带
  // 带有命令行的list进程命令是：“cmd.exe /c wmic process list full”
  //  tasklist 是没有带命令行参数的。可以把这两个命令再cmd里面执行一下看一下效果
  // 注意：命令行获取的都带有换行符，获取之后需要更换换行符。可以执行配合这个使用 str.replace(/[\r\n]/g,""); 去除回车换行符 
  let cmd = process.platform === 'win32' ? 'tasklist' : 'ps aux'
  //  var data='sdf'
  //  exec(cmd, function (err, stdout, stderr) {
  //    if (err) {
  //      return console.error(err)
  //    }
  //    console.log(Object.prototype.toString.call(stdout))
  //    data=stdout;
  //    stdout.split('\n').filter((line) => {
  //      let processMessage = line.trim().split(/\s+/)
  //      let processName = processMessage[0] //processMessage[0]进程名称 ， processMessage[1]进程id
  //      if (processName === name) {
  //        return cb(processMessage[1])
  //      }
  //    })
  //  })
   let data = await new Promise((resolve, reject) => {
     exec(cmd, function (err, stdout, stderr) {
       if (err) {
         return console.error(err);
       }
      //  console.log(Object.prototype.toString.call(stdout));
       resolve(stdout);
     });
   });
   return data;
}

function viewProcessMessage2() {
  return new Promise(function(resolve, reject) {
      var cmd = "node -v";
      exec(cmd,{
          maxBuffer: 1024 * 2000
      }, function(err, stdout, stderr) {
          if (err) {
              console.log(err);
              reject(err);
          } else if (stderr.length > 0) {
              reject(new Error(stderr.toString()));
          } else {
              console.log('stdout:',stdout);
              resolve();
          }
      });
  });
};

/**
 * 获取进程
 * @returns {Promise<*|*>}
 */
 async function viewProcessMessage () {//name, cb
  // return 12;
  var a='haha'
  let data=await new Promise(function(resolve, reject) {
    /* var cmd = "node -v";//监听80端口拿进程数
    exec(cmd,function(err, stdout, stderr) {
      if (err) {
          console.log(err);
          reject(err);
      } else if (stderr.length > 0) {
          reject(new Error(stderr.toString()));
      } else {
          // a=stdout;
          console.log('stdout:',stdout);
          resolve();
      }
    }) */
    var cmd = "netstat -nat|grep -i '80'|wc -l";//监听80端口拿进程数
    exec(cmd,{
        maxBuffer: 1024 * 2000
    }, function(err, stdout, stderr) {
        if (err) {
            console.log(err);
            reject(err);
        } else if (stderr.length > 0) {
            reject(new Error(stderr.toString()));
        } else {
            a=stdout;
            // console.log('stdout:',stdout);
            resolve();
        }
    });
  });
  return a;
}


/**
 * 监听资源
 * @returns {Promise<*|*>}
 */
async function resourceMonitor() {
    try {
        // var rule = new schedule.RecurrenceRule()
        let data=await systemConfiguration.find({'name':'resource_threshold'});
        var error=[];//或者能够在向首页发送通知的时候写入日志里面
        var checkJob = schedule.scheduleJob('*/10 * * * * *', function () {
            // console.log(data[0].configuration.CPU);
            let cpuRule=data[0].configuration.CPU;
            let cpu=getCpuPercentage().then(res=>{
              if(cpuRule.threshold>res.toString()){
                console.log('res:', res);
              }else{
                console.log(cpuRule.result,res)
              }
            });
            let memoryRule=data[0].configuration.Memory;
            let memory=getMemory().then(res=>{
              if(memoryRule.threshold>res.usedMemPercentage){
                console.log('res:', res.usedMemPercentage);
              }else{
                console.log(memoryRule.result,res.usedMemPercentage)
              }
            });
            let diskRule=data[0].configuration.Disk;
            let disk=getDisk().then(res=>{
              var calc = {
                used:0,
                sum: 0,
              };
              function myFunction(item, index){
                this.used+=  Math.floor(item.used/1024/1024/1024 * 100) / 100;
                this.sum+=  Math.floor(item.size/1024/1024/1024 * 100) / 100;
              }
              res.forEach(myFunction,calc)
              let diskPercentage=calc.used/calc.sum*100
              if(diskRule.threshold>diskPercentage){
                console.log('res:', diskPercentage);
              }else{
                console.log(diskRule.result,diskPercentage)
              }
            });
            // console.log(cpu);
/*            let disk=getDisk();
            console.log(disk);
            let memory=getMemory();
            console.log(memory);*/
        })
        if(error.length){console.log('+++++++++++++++++++++++++++')}
        // console.log('下一次检查时间：' + checkJob.nextInvocation())
    } catch (e) {
        return e;
    }
}
// resourceMonitor();
module.exports = {
  getCpuPercentage,
  getMemory,
  getDisk,
  viewProcessMessage,
  resourceMonitor
};
