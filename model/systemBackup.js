const mongoose = require("mongoose")

// 系统故障表的定义
const systemBackupSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  configuration:{
    type:Object,
    required:true
  }
})

const systemBackup = mongoose.model('system_backup',systemBackupSchema)
// const systemFailure = mongoose.model('system_failure',systemFailureSchema)
module.exports = systemBackup
