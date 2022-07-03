const redisClient = require('../config/redis');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const systemMeta = require('../model/systemMeta');
const { SuccessModel, ErrorModel } = require('../utils/resultModel');

class systemMetaService {
  constructor () {

    this.thisTime = new Date().getDay();
    this.userNumber = [];

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
      // 思路：获取从cmd的文本，然后切割出数据，最后判断接口网络状态好坏
      // 获取文本数据
      // const SHBAPP_DATA = await exec(`ping -c 4 -n ${api.SHBAPP}`);
      // const GZSRSJGW_DATA = await exec(`ping -c 4 -n ${api.GZSRSJGW}`);
      // const ZNFWJQRYPT_DATA = await exec(`ping -c 4 -n ${api.ZNFWJQRYPT}`);
      // const GDZWFWPT_DATA = await exec(`ping -c 4 -n ${api.GDZWFWPT}`);
      // const BDDT_DATA = await exec(`ping -c 4 -n ${api.BDDT}`);

      // // 提取文本或者错误回调
      // const SHBAPP = SHBAPP_DATA.stderr ? SHBAPP_DATA.stderr : SHBAPP_DATA.stdout;
      // const GZSRSJGW = GZSRSJGW_DATA.stderr ? GZSRSJGW_DATA.stderr : GZSRSJGW_DATA.stdout;
      // const ZNFWJQRYPT = ZNFWJQRYPT_DATA.stderr ? ZNFWJQRYPT_DATA.stderr : ZNFWJQRYPT_DATA.stdout;
      // const GDZWFWPT = GDZWFWPT_DATA.stderr ? GDZWFWPT_DATA.stderr : GDZWFWPT_DATA.stdout;
      // const BDDT = BDDT_DATA.stderr ? BDDT_DATA.stderr : BDDT_DATA.stdout;

      // // 处理文本数据
      // const SHBAPP_ARRAY = SHBAPP.split('\n').filter(item => item != '');
      // const GZSRSJGW_ARRAY = GZSRSJGW.split('\n').filter(item => item != '');
      // const ZNFWJQRYPT_ARRAY = ZNFWJQRYPT.split('\n').filter(item => item != '');
      // const GDZWFWPT_ARRAY = GDZWFWPT.split('\n').filter(item => item != '');
      // const BDDT_ARRAY = BDDT.split('\n').filter(item => item != '');

      // // 大致信息
      // const APPROXIMATE_SHBAPP = SHBAPP_ARRAY[SHBAPP_ARRAY.length - 1].split('=')[1].split(' ')[0].split('/');
      // const APPROXIMATE_GZSRSJGW = GZSRSJGW_ARRAY[GZSRSJGW_ARRAY.length - 1].split('=')[1].split(' ')[0].split('/');
      // const APPROXIMATE_ZNFWJQRYPT = ZNFWJQRYPT_ARRAY[ZNFWJQRYPT_ARRAY.length - 1].split('=')[1].split(' ')[0].split('/');
      // const APPROXIMATE_GDZWFWPT = GDZWFWPT_ARRAY[GDZWFWPT_ARRAY.length - 1].split('=')[1].split(' ')[0].split('/');
      // const APPROXIMATE_BDDT = BDDT_ARRAY[BDDT_ARRAY.length - 1].split('=')[1].split(' ')[0].split('/');

      // // 详细信息
      // const DETAILED_SHBAPP = SHBAPP_ARRAY[SHBAPP_ARRAY.length - 2].split(' ').filter(item => { return !Number.isNaN(Number(item)) }).map(item => Number(item));
      // const DETAILED_GZSRSJGW = GZSRSJGW_ARRAY[GZSRSJGW_ARRAY.length - 2].split(' ').filter(item => { return !Number.isNaN(Number(item)) }).map(item => Number(item));
      // const DETAILED_ZNFWJQRYPT = ZNFWJQRYPT_ARRAY[ZNFWJQRYPT_ARRAY.length - 2].split(' ').filter(item => { return !Number.isNaN(Number(item)) }).map(item => Number(item));
      // const DETAILED_GDZWFWPT = GDZWFWPT_ARRAY[GDZWFWPT_ARRAY.length - 2].split(' ').filter(item => { return !Number.isNaN(Number(item)) }).map(item => Number(item));
      // const DETAILED_BDDT = BDDT_ARRAY[SHBAPP_ARRAY.length - 2].split(' ').filter(item => { return !Number.isNaN(Number(item)) }).map(item => Number(item));

      // async function judgeConnectingIsSuccessful (APPROXIMATE, DETAILED) {
      //   if (DETAILED[0] > DETAILED[1]) {
      //     return "差"
      //   } else {
      //     if (APPROXIMATE[2] - APPROXIMATE[0] < 200 && APPROXIMATE[1] < 150) {
      //       return "优"
      //     } else {
      //       return "良"
      //     }
      //   }
      // }

      // const SHBAPP_INTERFACE_STATUS = await judgeConnectingIsSuccessful(APPROXIMATE_SHBAPP, DETAILED_SHBAPP);
      // const GZSRSJGW_INTERFACE_STATUS = await judgeConnectingIsSuccessful(APPROXIMATE_GZSRSJGW, DETAILED_GZSRSJGW);
      // const ZNFWJQRYPT_INTERFACE_STATUS = await judgeConnectingIsSuccessful(APPROXIMATE_ZNFWJQRYPT, DETAILED_ZNFWJQRYPT);
      // const GDZWFWPT_INTERFACE_STATUS = await judgeConnectingIsSuccessful(APPROXIMATE_GDZWFWPT, DETAILED_GDZWFWPT);
      // const BDDT_INTERFACE_STATUS = await judgeConnectingIsSuccessful(APPROXIMATE_BDDT, DETAILED_BDDT);

      // 在window使用的测试数据
      const SHBAPP_INTERFACE_STATUS = '优';
      const GZSRSJGW_INTERFACE_STATUS = '优';
      const ZNFWJQRYPT_INTERFACE_STATUS = '优';
      const GDZWFWPT_INTERFACE_STATUS = '优';
      const BDDT_INTERFACE_STATUS = '优';

      this.interfaceData = {
        SHBAPP: SHBAPP_INTERFACE_STATUS,
        GZSRSJGW: GZSRSJGW_INTERFACE_STATUS,
        ZNFWJQRYPT: ZNFWJQRYPT_INTERFACE_STATUS,
        GDZWFWPT: GDZWFWPT_INTERFACE_STATUS,
        BDDT: BDDT_INTERFACE_STATUS
        // SHBAPP, GZSRSJGW, ZNFWJQRYPT, GDZWFWPT, BDDT
      };
      return this.interfaceData;
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
    let that = this;

    // 网络接口问题：每隔12个小时来ping一下
    setInterval(async () => {
      // 注意this的换绑问题，箭头函数本身是没有this的
      await that.setApiData(this.api);
    }, 3600);

    
    // 15分钟做一次用户获取状态
    setInterval(async () => {
      await that.getUserOnlineNumber();
    }, 15 * 60 * 1000);
  }

  // 修改接口并重新ping
  async patchInterface (api) {
    try {
      await systemMeta.updateOne({ id: 0 }, api);
      this.api = api;
      await this.setApiData(this.api);
      return new SuccessModel({
        msg: "获取接口数据成功",
        data: this.interfaceData
      });
    } catch (error) {
      return new ErrorModel({
        msg: '获取修改接口失败'
      });
    }
  }
  
  async getInterfaceMessage () {
    try {
      await this.setApiData(this.api);
      return new SuccessModel({
        msg: "获取接口数据成功",
        data: this.interfaceData
      })
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
      await selectRedisDatabase(db);
    }
  }

  // 获取在线用户数目
  async getUserOnlineNumber () {
    await this.selectRedisDatabase(1);
    try {
      const thisDay = new Date().getDay();
      if (thisDay !== this.thisTime) {
        this.userNumber = [];
        this.thisTime = thisDay;
      }
      const getUserOnlineNum = await redisClient.dbSize();
      this.userNumber.push(getUserOnlineNum);
      await this.selectRedisDatabase(0);
      return getUserOnlineNum
      
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // 获取当天最大用户数目
  async getMaxUserOnlineNumberOnThisDay () {
    try {
      await this.getUserOnlineNumber();
      return this.userNumber.sort((a, b) => b - a)[0] ? this.userNumber.sort((a, b) => b - a)[0] : 0;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getUserOnlineNumberAndMaxOnlineNumber () {
    try {
      const UserOnlineNumber = await this.getUserOnlineNumber();
      const MaxUserOnlineNumberOnThisDay = await this.getMaxUserOnlineNumberOnThisDay();
      return new SuccessModel({
        msg: '获取在线用户数目成功',
        data: {
          userOnline: UserOnlineNumber,
          userMax: MaxUserOnlineNumberOnThisDay
        }
      });
    } catch (error) {
      throw new ErrorModel({
        msg: '获取在线用户数目失败'
      });
    }
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