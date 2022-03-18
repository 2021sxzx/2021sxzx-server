const mongoose = require("mongoose")

// systemLog表的定义
const systemLogSchema = new mongoose.Schema({
  log_id:{  //日志编号
    type:String,
    required:true
  },
  create_time:{   // 发生时间
    type:String,
    required:true
  },
  content:{  //日志内容
    type:String,
    required:true
  },
  idc:{
    type:String
  },
  user_name:{
    type:String
  }
})

const systemLog = mongoose.model('system_log',systemLogSchema)
module.exports = systemLog
