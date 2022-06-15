const personalService = require('../service/personalService');

function setStatusCode(res,data) {
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
}

class personalController {
  async getTopBarData (req, res) {
    const token = req.cookies["auth-token"];
    const result = await personalService.getPersonalMsg(token);
    setStatusCode(res, result);
    res.json(result);
  }
}

module.exports = new personalController();