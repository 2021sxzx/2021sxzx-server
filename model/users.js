const mongoose = require("mongoose")

// users表的定义
const usersSchema = new mongoose.Schema({
  // XXX(钟卓江)：头像用string表示没问题吗，是图片 url 还是说二进制表示
  profile_picture: {   // 头像
    type: String,
    default: ''
  },
  user_name: {  // 用户名
    type: String,
    required: true
  },
  role_name: {  // 角色名称
    type: String,
    required: true
  },
  account: {   // 账号-手机号
    type: String,
    required: true
  },
  password: { // 密码
    type: String,
    required: true
  },
  activation_status: { //激活状态
    type: Number,
    default: 0
  },
  user_rank: { //用户身份
    type: Number,
    default: 0 //默认是业务员
  },
  // 单位id
  unit_id: {
    type: String,
    require: true
  }
});

const users = mongoose.model('users', usersSchema);
module.exports = users;