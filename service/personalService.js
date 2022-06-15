const users = require('../model/users');
const redisClient = require('../config/redis');

class personalService {
  async getPersonalMsg (token) {
    const res = await redisClient.get(token);
    console.log(res);
  }
}


module.exports = new personalService();
