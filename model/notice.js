const mongoose = require("mongoose")

// comment表的定义
const noticeSchema = new mongoose.Schema({
  notice_id:{   // 通知编号
    type:String,
    required:true
  },
  content:{   //通知内容
    type:String,
    required:true
  },
  release_status:{   // 发布状态
    type:Boolean,
    default:0
  },
  notice_theme:{    //发布主题
    type:String,
    required:true
  },
  release_time:{   //发布时间
    type:String,
    required:true
  },
  department_name:{  // 接收的部门名称
    type:String,
    required:true
  },
  idc:{   // 发布的用户id
    type:String,
    required:true
  }
})

const notice = mongoose.model('notice',noticeSchema)
module.exports = notice
