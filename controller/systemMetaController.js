const systemMetaService = require('../service/systemMetaService');
const {ErrorModel} = require('../utils/resultModel');

function setStatusCode(res,data) {
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
}

class systemMetaController {
  // 获取在线人数和当日最大人数
  async getUserOnlineNumberAndMaxOnlineNumber (req, res) {
    try {
      const result = await systemMetaService.getUserOnlineNumberAndMaxOnlineNumber();
      setStatusCode(res, result);
      res.json(result);
    } catch (error) {
      res.json(new Error(error.message));
    }
  }

  // 获取网络状态
  async getNetworkStatus (req, res) {
    try {
      const result = await systemMetaService.getInterfaceMessage();
      setStatusCode(res, result);
      res.json(result);
    } catch (error) {
      res.json(new Error(error.message));
    }
  }

  // 修改域名并获取网络状态
  async patchNetworkStatus (req, res) {
    try {
      const api = req.body;
      const result = await systemMetaService.patchInterface(api);
      setStatusCode(res, result);
      res.json(result);
    } catch (error) {
      res.json(new Error(error.message));
    }
  }
}

module.exports = new systemMetaController();