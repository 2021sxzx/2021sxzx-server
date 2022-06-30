const mongoose = require("mongoose")

//角色表的定义
const roleSchema = new mongoose.Schema({
  role_name: {   // 角色名称
    type: String,
    unique:[true, '角色名称不能重复'],
    required: [true, '请传入角色名称，角色名不能为空'],
    maxlength:[50, '角色名长度不能超过50个字符']
  },
  role_describe: { // 角色描述
    type: String,
    maxlength:[500, '角色描述长度不能超过500个字符'],
    default:'角色描述暂未添加'
  },
  role_rank: {
    type: Number,
    default: 1
  },
  role_id: {
    type: Number,
    default: Date.now()
  }
})

const role = mongoose.model('role', roleSchema);
module.exports = role;