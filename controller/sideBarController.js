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
  // 重修了侧边栏接口
  async sideBarList (req, res) {
    try {
      const {role_id} = req.body;
      const result = await sideBarDataService.createTree(Number(role_id));
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