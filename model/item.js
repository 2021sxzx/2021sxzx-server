const mongoose = require("mongoose")

// comment表的定义
const itemSchema = new mongoose.Schema({
  item_id:{       // 事项编码
    type:String,
    required:true
  },
  release_time:{  // 发布时间
    type:String,
  },
  item_status:{   // 事项状态
    type:Number,
    default:0
  },
  create_time:{   // 创建时间
    type:String,
    default:Date.now()
  },
  item_guide_id:{ // 事项指南编码
    type:String,
  },
  item_rule_id:{  // 事项规则id
    type:String
  }
})

const item = mongoose.model('item',itemSchema)
module.exports = item
