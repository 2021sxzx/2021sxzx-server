const mongoose = require("mongoose")

// 系统故障表的定义
const systemConfigurationSchema = new mongoose.Schema({
  // 名字
  name:{
    type:String,
    required:true
  },
  // 设置
  configuration:{
    type:Object,
    required:true
  }
})

const systemConfiguration = mongoose.model('system_configuration',systemConfigurationSchema)
// const systemFailure = mongoose.model('system_failure',systemFailureSchema)
module.exports = systemConfiguration
