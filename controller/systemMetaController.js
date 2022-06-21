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
  async getUserOnlineNumber (req, res) {
    try {
      const result = await systemMetaService.getUserOnlineNumber();
      setStatusCode(res, result);
      res.json(result);
    } catch (error) {
      return new ErrorModel({
        msg: error.message
      })
    }
  }

  async networkQualityOfInterface (req, res) {
    
  }
}

module.exports = new systemMetaController();