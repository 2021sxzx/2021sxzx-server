const mongoose = require("mongoose")

// 系统故障表的定义
const systemConfigurationSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  configuration:{
    type:Object,
    required:true
  }
})

const systemConfiguration = mongoose.model('system_configuration',systemConfigurationSchema)
// const systemFailure = mongoose.model('system_failure',systemFailureSchema)
module.exports = systemConfiguration
