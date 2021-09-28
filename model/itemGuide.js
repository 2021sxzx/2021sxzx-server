const mongoose = require("mongoose")

// comment表的定义
const itemGuideSchema = new mongoose.Schema({
  item_guide_id:{
    type:String,
    required:true
  },
  item_guide_name:{
    type:String,
    required:true
  },
  item_guide_content:{
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

const itemGuide = mongoose.model('item_guide',itemGuideSchema)
module.exports = itemGuide
