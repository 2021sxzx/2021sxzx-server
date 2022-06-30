const mongoose = require("mongoose")

const roleMapPermissionSchema = new mongoose.Schema({
  role_id: {
    type: Number,
    required: [true, '请传入角色名称，角色名不能为空'],
    maxlength:[50, '角色名长度不能超过50个字符']
  },
  permission_identifier: {
    type: Number,
    require: true
  }
})

const roleMapPermission = mongoose.model(
  'roleMapPermission', 
  roleMapPermissionSchema
)

module.exports = roleMapPermission