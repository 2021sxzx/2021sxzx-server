const {
  addPermission,
  deletePermission,
  searchPermission,
  patchPermission
} = require('../service/permissionService');
const { SuccessModel, ErrorModel } = require('../utils/resultModel')

class permissionController {

  async addPermissionAndReturn (req, res) {
    const {
      role_name,
      permission_identifier_array
    } = req.body;
    const res = await addPermission(role_name, ...permission_identifier_array);
    return new SuccessModel({
      msg: '添加权限成功',
      data: res,
    })
  }

  async deletePermissionAndReturn (req, res) {
    const {
      role_name
    } = req.body;
    const res = await deletePermission(role_name);
    return new SuccessModel({
      msg: '删除角色权限成功',
      data: res
    })
  }

  async searchPermission (req, res) {
    const {
      role_name
    } = req.query;
    const res = await searchPermission(role_name);
    return new SuccessModel({
      msg: '查找角色权限成功',
      data: res
    })
  }

  async patchPermission (req, res) {
    const {
      role_name,
      permission_identifier_array
    } = req.body;
    const res = await patchPermission(role_name, ...permission_identifier_array);
    return new SuccessModel({
      msg: '修改权限成功',
      data: res
    })
  }
}

module.exports = new permissionController();