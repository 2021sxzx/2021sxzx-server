const mongoose = require("mongoose")

// image_source表的定义
const image_sourceSchema = new mongoose.Schema({
    img_name: {//图片名称
        type: String,
    },
    img_path: {// 图片路径
        type: String,
        required: true
    }
})

const image_source = mongoose.model('image_source', image_sourceSchema)
module.exports = image_source
