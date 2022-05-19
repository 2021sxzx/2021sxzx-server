const mongoose = require("mongoose")

// comment表的定义
const departmentSchema = new mongoose.Schema({
  department_name:{   // 部门名称
    type:String,
    required:true
  },
  department_id: { // 部门名称对应的id
    type: Number,
    require: true
  },
  subordinate_departments:{   //下属部门
    type:Array,
    default:[]
  },
  // 所属单位id
  unit_id: {
    type: String,
    require: true
  }
})

const department = mongoose.model('department',departmentSchema)
module.exports = department;