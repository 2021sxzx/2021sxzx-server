const mongoose = require("mongoose")

// comment表的定义
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
  }
})

const systemLog = mongoose.model('systemLog',systemLogSchema)
module.exports = systemLog
