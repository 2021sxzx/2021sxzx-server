const mongoose = require("mongoose")

// comment表的定义
const userDepartmentSchema = new mongoose.Schema({
  idc:{  // 用户的证件号码
    type:String,
    required:true
  },
  user_name:{   //用户的名字
    type:String,
    required:true
  },
  join_time:{   //加入的时间
    type:String,
    required:true
  },
  department_name:{  //部门的名称
    type:String,
    required:true
  }
})

const userDepartment = mongoose.model('userDepartment',userDepartmentSchema)
module.exports = userDepartment
