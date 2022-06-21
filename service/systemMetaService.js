const redisClient = require('../config/redis');
var cp = require("child_process");
const iconv = require('iconv-lite');
const { SuccessModel, ErrorModel } = require('../utils/resultModel');

class systemMetaService {
  constructor () {
    this.userNumber = [];
    this.lastWeekUserNumber = [];
    
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
    cp.execFile("ping -c 4 -n", [url], function(err, stdout, stderr){
      if(err){console.log(err)}
      const a = iconv.decode(Buffer.from(stdout, 'binary'), 'gbk');
      console.log(stdout);
      console.log(a);
    })
    // await cp.exec(`ping ${url}`, { encoding: 'binary' }, function(err, stdout, stderr){
    //   console.log(stdout);
    //   console.log(iconv.decode(new Buffer(stdout, 'binary'), 'cp936'));
    // });
  }
}

module.exports = new systemMetaService();