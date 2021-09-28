const mongoose = require("mongoose")

// comment表的定义
const itemRuleSchema = new mongoose.Schema({
  create_time:{  // 创建时间
    type:String,
    default:Date.now()
  },
  content:{      // 事项规则内容
    type:String,
    required:true
  },
  rule_id:{      // 事项规则id
    type:String,
    required:true
  },
})

const itemRule = mongoose.model('item_rule',itemRuleSchema)
module.exports = itemRule
