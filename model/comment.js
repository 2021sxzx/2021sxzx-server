const mongoose = require("mongoose")

// 评论表的定义
const commentSchema = new mongoose.Schema({
  create_time: {
    type: String,
  },
  idc:{            // 证件号
    type: String,
    required: true
  },
  show_status:{    // 评论显示状态
    type: Boolean,
    default: true
  },
  check_status:{   // 审核状态
    type: Boolean,
    default: false
  },
  content:{        // 评价内容
    type: String,
    default: ""
  },
  idc_type:{       // 证件类型
    type: String,
    default: "居民身份证"
  },
  score:{          // 评价分数
    type: String,
    required: true
  },
  item_id:{        // 事项编码
    type: String,
    required: true
  }
})

const comment = mongoose.model('comment', commentSchema)
module.exports = comment
