const mongoose = require("mongoose")

// comment表的定义
const usersSchema = new mongoose.Schema({
  idc:{   //证件号码
    type: String,
    required:true
  },
  profile_picture:{   // 头像
    type: String,
    default: ''
  },
  user_name:{  // 用户名
    type: String,
    required:true
  },
  role_name:{  // 角色名称
    type: Object,
    required:true
  },
  account:{   // 账号信息
    type: String,
    required:true
  },
  password: {
    type: String,
    required:true
  },
  activation_status:{   //激活状态
    type: Number,
    default:0
  }
})

const users = mongoose.model('users',usersSchema)
module.exports = users
