const mongoose = require("mongoose")

// comment表的定义
const departmentMapUserSchema = new mongoose.Schema({
  account:{  // 用户的证件号码
    type:String,
    required:true
  },
  user_name:{   //用户的名字
    type:String,
    required:true
  },
  join_time:{   //加入的时间
    type:Number,
    required:true
  },
  department_name: {  //部门的名称
    type:String,
    required:true
  }
})

const departmentMapUser = mongoose.model('departmentMapUser',departmentMapUserSchema)
module.exports = departmentMapUser;