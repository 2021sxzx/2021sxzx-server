const mongoose = require("mongoose")

// comment表的定义
const roleSchema = new mongoose.Schema({
  role_name:{   // 角色名称
    type:String,
    required:true
  }
})

const role = mongoose.model('role',roleSchema)
module.exports = role
