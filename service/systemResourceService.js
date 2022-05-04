// const systemLog = require("../model/systemLog");
// const users = require("../model/users");
const fs = require("fs");
var osu = require("node-os-utils");
const si = require("systeminformation");
var cpu = osu.cpu;
var mem = osu.mem;
const childProcess = require('child_process'); // nodeJS 自带
const exec = childProcess.exec
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

/**
 * 获取进程
 * @returns {Promise<*|*>}
 */
 async function viewProcessMessage () {//name, cb
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
 

module.exports = {
  getCpuPercentage,
  getMemory,
  getDisk,
  viewProcessMessage
};
