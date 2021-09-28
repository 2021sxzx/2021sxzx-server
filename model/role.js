const mongoose = require("mongoose")

// c表的定角色名称的定义
const roleSchema = new mongoose.Schema({
  role_name:{   // 角色名称
    type:String,
    required:true
  }
})

const role = mongoose.model('role',roleSchema)
module.exports = role
