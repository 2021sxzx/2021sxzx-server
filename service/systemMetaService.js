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

  async init () {
    const [domain] = await systemMeta.find({});
    this.api = {
      SHBAPP: domain.SHBAPP,
      GZSRSJGW: domain.GZSRSJGW,
      ZNFWJQRYPT: domain.ZNFWJQRYPT,
      GDZWFWPT: domain.GDZWFWPT,
      BDDT: domain.BDDT
    };

    // 每隔一个钟来ping一下
    setInterval(async () => {
      const SHBAPP_DATA = await exec(`ping ${this.api.SHBAPP}`);
      const GZSRSJGW_DATA = await exec(`ping ${this.api.GZSRSJGW}`);
      const ZNFWJQRYPT_DATA = await exec(`ping ${this.api.ZNFWJQRYPT}`);
      const GDZWFWPT_DATA = await exec(`ping ${this.api.GDZWFWPT}`);
      const BDDT_DATA = await exec(`ping ${this.api.BDDT}`);
      // console.log('stdout:', SHBAPP_DATA.stdout);
      // console.error('stderr:', SHBAPP_DATA.stderr);
      const SHBAPP = SHBAPP_DATA.stderr ? SHBAPP_DATA.stderr : SHBAPP_DATA.stdout;
      const GZSRSJGW = GZSRSJGW_DATA.stderr ? GZSRSJGW_DATA.stderr : GZSRSJGW_DATA.stdout;
      const ZNFWJQRYPT = ZNFWJQRYPT_DATA.stderr ? ZNFWJQRYPT_DATA.stderr : ZNFWJQRYPT_DATA.stdout;
      const GDZWFWPT = GDZWFWPT_DATA.stderr ? GDZWFWPT_DATA.stderr : GDZWFWPT_DATA.stdout;
      const BDDT = BDDT_DATA.stderr ? BDDT_DATA.stderr : BDDT_DATA.stdout;
      this.interfaceData = {
        SHBAPP,
        GZSRSJGW,
        ZNFWJQRYPT,
        GDZWFWPT,
        BDDT
      }
      console.log(this.interfaceData);
    }, 3600 * 1000);
  }

  async patchInterface (api) {
    try {
      await systemMeta.updateOne({ id: 0 }, api);
    } catch (error) {
      return new ErrorModel({
        msg: '获取修改接口失败'
      });
    }
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

  // 测试接口的网络连接质量
  async networkQualityOfInterface (url) {
    // cp.exec(`ping ${url}`, function(err, stdout, stderr){
    //   if(err){console.log(err)}
    //   const a = iconv.decode(Buffer.from(stdout, 'binary'), 'gbk');
    //   console.log(stdout);
    //   console.log(a);
    // });
    // await cp.exec(`ping ${url}`, { encoding: 'binary' }, function(err, stdout, stderr){
    //   console.log(stdout);
    //   console.log(iconv.decode(new Buffer(stdout, 'binary'), 'cp936'));
    // });
  }
}

const _systemMetaService = new systemMetaService();

// IIFE，让初始化能够提前执行
(async () => {
  await _systemMetaService.init();
})()

module.exports = _systemMetaService;