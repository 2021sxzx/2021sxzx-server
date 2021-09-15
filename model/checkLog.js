const mongoose = require("mongoose")

// comment表的定义
const checkLogSchema = new mongoose.Schema({
  check_id:{       // 审核编号
    type:String,
    required:true
  },
  check_time:{     // 审核时间
    type:String,
    required:true
  },
  check_advice:{   // 审核建议
    type:String,
  },
  department_name:{ // 审核的部门
    type:String,
    required:true
  },
  item_guide_id:{
    type:String,
  },
  item_id:{
    type:String,
  },
  rule_id:{
    type:String
  }
})

const checkLog = mongoose.model('checkLog',checkLogSchema)
module.exports = checkLog
