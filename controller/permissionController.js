const {
  addPermission,
  deletePermission,
  searchPermission,
  patchPermission,
  getPermissionList
} = require('../service/permissionService');
const { SuccessModel } = require('../utils/resultModel')

function setStatusCode(res,data) {
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
}

class permissionController {

  async addPermissionAndReturn (req, res) {
    const {
      role_id,
      permission_identifier_array
    } = req.body;
    const result_ = await addPermission(Number(role_id), ...permission_identifier_array);
    let result = new SuccessModel({
      msg: '添加权限成功',
      data: result_,
    })
    setStatusCode(res, result)
    res.json(result);
  }

  async deletePermissionAndReturn (req, res) {
    const {
      role_id
    } = req.body;
    const result_ = await deletePermission(Number(role_id));
    let result = new SuccessModel({
      msg: '删除角色权限成功',
      data: result_
    })
    setStatusCode(res, result)
    res.json(result);
  }

  async searchPermissionAndReturn (req, res) {
    let {
      role_id
    } = req.query;
    role_id = Number(role_id);
    const result_ = await searchPermission(role_id);
    let result = new SuccessModel({
      msg: '查找角色权限成功',
      data: result_
    })
    setStatusCode(res, result)
    res.json(result);
  }

  async patchPermissionAndReturn (req, res) {
    const {
      role_id,
      permission_identifier_array
    } = req.body;
    const result_ = await patchPermission(Number(role_id), ...permission_identifier_array);
    let result = new SuccessModel({
      msg: '修改权限成功',
      data: result_
    })
    setStatusCode(res, result)
    res.json(result);
  }

  async getPermissionListAndReturn (req, res) {
    const result_ = await getPermissionList();
    let result = new SuccessModel({
      msg: '返回权限列表成功',
      data: result_
    })
    setStatusCode(res, result)
    res.json(result);
  }
}

module.exports = new permissionController();