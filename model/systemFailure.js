const mongoose = require("mongoose")

// comment表的定义
const systemFailureSchema = new mongoose.Schema({
  failure_picture:{
    type:String,
  },
  failure_des:{
    type:String,
    required:true
  },
  failure_time:{
    type:String,
    required:true
  },
  failure_name:{
    type:String,
    required:true
  },
  idc:{
    type:String,
    required:true
  }
})

const systemFailure = mongoose.model('systemFailure',systemFailureSchema)
module.exports = systemFailure
