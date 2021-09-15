
const mongoose = require("mongoose")

// comment表的定义
const ruleSchema = new mongoose.Schema({
  rule_id:{
    type:String,
    required:true
  },
  rule_name:{    // 规则项名称
    type:String,
    required:true
  },
  parentId:{     // 父节点的id名称
    type:String,
    default:"0"  // 默认为根节点
  }
})

const rule = mongoose.model('itemRule',ruleSchema)
module.exports = rule
