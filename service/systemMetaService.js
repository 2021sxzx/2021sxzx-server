const redisClient = require('../config/redis');
// var cp = require("child_process");
const iconv = require('iconv-lite');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const systemMeta = require('../model/systemMeta');
const { SuccessModel, ErrorModel } = require('../utils/resultModel');

class systemMetaService {
  constructor () {

    this.userNumber = [];
    this.lastWeekUserNumber = [];

    this.api = {
      SHBAPP: null,
      GZSRSJGW: null,
      ZNFWJQRYPT: null,
      GDZWFWPT: null,
      BDDT: null
    }

    this.interfaceData = {
      SHBAPP: null,
      GZSRSJGW: null,
      ZNFWJQRYPT: null,
      GDZWFWPT: null,
      BDDT: null
    }
  }

  async setApiData (api) {
    try {
      // CentOS的CMD指令集，和window的指令是不兼容的，如果需要在window跑起该代码，需要改为：ping ${this.api.xxx}
      // const SHBAPP_DATA = await exec(`ping -c 4 -n ${api.SHBAPP}`);
      // const GZSRSJGW_DATA = await exec(`ping -c 4 -n ${api.GZSRSJGW}`);
      // const ZNFWJQRYPT_DATA = await exec(`ping -c 4 -n ${api.ZNFWJQRYPT}`);
      // const GDZWFWPT_DATA = await exec(`ping -c 4 -n ${api.GDZWFWPT}`);
      // const BDDT_DATA = await exec(`ping -c 4 -n ${api.BDDT}`);
      const SHBAPP_DATA = await exec(`ping ${api.SHBAPP}`);
      const GZSRSJGW_DATA = await exec(`ping ${api.GZSRSJGW}`);
      const ZNFWJQRYPT_DATA = await exec(`ping ${api.ZNFWJQRYPT}`);
      const GDZWFWPT_DATA = await exec(`ping ${api.GDZWFWPT}`);
      const BDDT_DATA = await exec(`ping ${api.BDDT}`);
      const SHBAPP = SHBAPP_DATA.stderr ? SHBAPP_DATA.stderr : SHBAPP_DATA.stdout;
      const GZSRSJGW = GZSRSJGW_DATA.stderr ? GZSRSJGW_DATA.stderr : GZSRSJGW_DATA.stdout;
      const ZNFWJQRYPT = ZNFWJQRYPT_DATA.stderr ? ZNFWJQRYPT_DATA.stderr : ZNFWJQRYPT_DATA.stdout;
      const GDZWFWPT = GDZWFWPT_DATA.stderr ? GDZWFWPT_DATA.stderr : GDZWFWPT_DATA.stdout;
      const BDDT = BDDT_DATA.stderr ? BDDT_DATA.stderr : BDDT_DATA.stdout;
      this.interfaceData = { 
        SHBAPP: SHBAPP.split('\r\n').filter(item => item != ''), 
        GZSRSJGW: GZSRSJGW.split('\r\n').filter(item => item != ''), 
        ZNFWJQRYPT: ZNFWJQRYPT.split('\r\n').filter(item => item != ''),
        GDZWFWPT: GDZWFWPT.split('\r\n').filter(item => item != ''),
        BDDT: BDDT.split('\r\n').filter(item => item != '')
        // SHBAPP, GZSRSJGW, ZNFWJQRYPT, GDZWFWPT, BDDT
      };
    } catch (error) {
      return new ErrorModel({
        msg: error
      });
    }
  }

  async init () {
    const [domain] = await systemMeta.find({});
    this.api = {
      SHBAPP: domain.SHBAPP,
      GZSRSJGW: domain.GZSRSJGW,
      ZNFWJQRYPT: domain.ZNFWJQRYPT,
      GDZWFWPT: domain.GDZWFWPT,
      BDDT: domain.BDDT
    };

    // 第一次的触发执行
    await this.setApiData(this.api);
    const that = this;
    // 每隔一个钟来ping一下
    setInterval(async () => {
      // 注意this的换绑问题，箭头函数本身是没有this的
      await that.setApiData(this.api);
    }, 3600);
  }

  // 修改接口
  async patchInterface (api) {
    try {
      await systemMeta.updateOne({ id: 0 }, api);
      this.api = api;
    } catch (error) {
      return new ErrorModel({
        msg: '获取修改接口失败'
      });
    }
  }
  
  async getInterfaceMessage () {
    const regexp = /[0-9]+/g
    for (let index in this.interfaceData) {
      this.interfaceData[index] = this.interfaceData[index].map(item => {
        return item.match(regexp)
      })
    }
    console.log(this.interfaceData);
  }


  // 切换db池
  async selectRedisDatabase (db) {
    try {
      await redisClient.select(db);
    } catch (error) {
      await selectRedisDatabase (db);
    }
  }

  // 获取在线用户数目
  async getUserOnlineNumber () {
    await this.selectRedisDatabase(1);
    try {
      const getUserOnlineNum = await redisClient.dbSize();
      this.userNumber.push({
        user: getUserOnlineNum,
        time: new Date()
      });
      await this.selectRedisDatabase(0);
      return new SuccessModel({
        msg: '获取在线用户数目成功',
        getUserOnlineNumber: getUserOnlineNum
      });
      
    } catch (error) {
      await this.selectRedisDatabase(0);
      return new ErrorModel({
        msg: '获取在线用户数目失败'
      });
    }
  }

  // 获取当天最大用户数目
  async getMaxUserOnlineNumberOnThisDay () {
    return new SuccessModel({
      msg: '获取在线用户数目成功',
      data: this.userNumber.sort((a, b) => b - a)[0]
    });
  }

  // 获取当天平均用户数目
  async getAverageUserOnlineNumberOnThisDay () {
    const res = this.userNumber.reduce((a, b) => a + b);
    return new SuccessModel({
      msg: '获取平均用户数目成功',
      data: res / this.userNumber.length
    })
  }
}

const _systemMetaService = new systemMetaService();

// IIFE，让初始化能够提前执行
(async () => {
  await _systemMetaService.init();
})()

module.exports = _systemMetaService;