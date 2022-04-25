const mongoose = require("mongoose")

// 系统故障表的定义
const systemFailureSchema = new mongoose.Schema({
  failure_picture:{
    type:Array,
  },
  failure_des:{
    type:String,
    required:true
  },
  failure_time:{
    type:String,
    required:true
  },
  failure_name:{
    type:String,
    required:true
  },
  user_name:{
    type:String,
    required:true
  }
})

const systemFailure = mongoose.model('system_failure',systemFailureSchema)
module.exports = systemFailure
