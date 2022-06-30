const sideBarDataService = require('../service/sideBarDataService');
const {ErrorModel} = require('../utils/resultModel');

function setStatusCode(res,data) {
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
}

class sideBarController {
  // 重构了侧边栏接口，使得数据获取变快
  async sideBarList (req, res) {
    try {
      const result = await sideBarDataService.createTree(Number(req.cookies.role_id));
      setStatusCode(res, result);
      res.json(result);
    } catch (error) {
      return new ErrorModel({
        msg: "获得侧边栏失败",
        data: error.message
      })
    }
  }
}

module.exports = new sideBarController();