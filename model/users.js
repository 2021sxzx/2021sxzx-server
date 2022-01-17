const mongoose = require("mongoose")

// comment表的定义
const usersSchema = new mongoose.Schema({
  idc:{   //证件号码, XXX(钟卓江)：这个idc可能是多余的，如果最后都没用上就可以考虑删掉
    type:String,
    required:true
  },
  profile_picture:{   // 头像
    type:String,
  },
  user_name:{  // 用户名
    type:String,
    required:true
  },
  role_name:{  // 角色名称
    type:String,
    required:true
  },
  account:{   // 账号信息
    type:String,
    required:true
  },
  activation_status:{   //激活状态
    type:Number,
    default:0
  }
})

const users = mongoose.model('users',usersSchema)
module.exports = users
