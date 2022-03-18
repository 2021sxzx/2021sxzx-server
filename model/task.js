const mongoose = require("mongoose")

// 事项指南表的定义
const taskSchema = new mongoose.Schema({
  task_code:{ // 事项指南编码
    type:String,
  },
  task_name:{ // 事项指南名称
    type:String,
  },
  audit_material:[ // 材料，格式数组
    {
      material_name:{ // 材料名称
        type:String,
      },
      page_num:{ // 原件数量
        type:Number,
      },
      page_copynum: { // 复印件数量
        type:Number,
      },
      is_need_text: { // 材料要求
        type:String,
      },
      material_type_text: { // 材料类型
        type:String,
      },
      zzhdzb_text: { // 材料形式
        type:String,
      },
      page_format: { // 纸质材料规格
        type:String,
      },
      submissionrequired: { // 是否免提交
        type:String,
      }
    }
  ],
  audit_catalog_lobby:[ // 办理窗口
    {
      name:{ // 办理窗口名称
        type:String,
      },
      address: { // 办理地点
        type:String,
      },
      tel: { // 办公电话
        type:String,
      },
      time: { // 办公时间
        type:String,
      }
    }
  ],
  wsbllc: { // 网上办理流程
    type:String,
  },
  ckbllc: { // 窗口办理流程
    type:String,
  }
})

taskSchema.statics.findByTaskCode = function (task_code,callback)  {
  this.find({task_code:task_code},callback)
}

const task = mongoose.model('task',taskSchema)
module.exports = task
