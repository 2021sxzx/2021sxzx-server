const mongoose = require("mongoose")

// comment表的定义
const departmentSchema = new mongoose.Schema({
  department_name:{   // 部门名称
    type:String,
    required:true
  },
  subordinate_departments:{   //下属部门
    type:Array,
    default:[]
  }
})

const department = mongoose.model('department',departmentSchema)
module.exports = department
