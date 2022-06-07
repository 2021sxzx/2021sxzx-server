const unitService = require('../service/unitService');

function setStatusCode(res,data) {
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
}

class unitController {
  async addUnit (req, res) {
    const {
      unit_name,
      parent_unit
    } = req.body;

    const result = await unitService.addUnit(unit_name, parent_unit);
    setStatusCode(res, result);
    res.json(result);
  }

  async deleteUnit (req, res) {
    const { unit_id } = req.body;
    const result = await unitService.deleteUnit(unit_id);
    setStatusCode(res, result);
    res.json(result);
  }

  async updateUnit (req, res) {
    const { unit_id, new_unit_name } = req.body;
    const result = await unitService.updateUnit(unit_id, new_unit_name);
    setStatusCode(res, result);
    res.json(result);
  }

  // async lookupUnit (req, res) {
  //   const { unit_id } = req.query;
  //   const result = await unitService.lookupUnit(unit_id);
  //   setStatusCode(res, result);
  //   res.json(result);
  // }

  async getUnit (req, res) {
    // const { unit_id = 1653018366962 } = req.body;
    // const unit_id = req.cookie.unit_id;
    console.log(req.cookies.role_id)
    const result = await unitService.newUnitTree(Number(req.cookies.unit_id));
    setStatusCode(res, result);
    res.json(result);
  }

  async searchUnit (req, res) {
    const { searchValue } = req.body;
    const result = await unitService.searchUnit(searchValue);
    setStatusCode(res, result);
    res.json(result);
  }

  async getUserById (req, res) {
    const { unit_id } = req.body;
    const result = await unitService.getUserById(unit_id);
    setStatusCode(res, result);
    res.json(result);
  }
}

module.exports = new unitController();