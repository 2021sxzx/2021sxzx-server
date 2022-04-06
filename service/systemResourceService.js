// const systemLog = require("../model/systemLog");
// const users = require("../model/users");
const fs = require("fs");
var osu = require("node-os-utils");
const si = require("systeminformation");
var cpu = osu.cpu;
var mem = osu.mem;

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

module.exports = {
  getCpuPercentage,
  getMemory,
  getDisk
};
