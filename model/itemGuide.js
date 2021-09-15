const mongoose = require("mongoose")

// comment表的定义
const itemGuideSchema = new mongoose.Schema({
  item_guide_id:{
    type:String,
    required:true
  },
  create_time:{
    type:String,
    default:Date.now()
  },
  item_id:{
    type:String
  },
  
})

const itemGuide = mongoose.model('itemGuide',itemGuideSchema)
module.exports = itemGuide
