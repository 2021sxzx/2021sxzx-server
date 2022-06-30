const mongoose = require("mongoose")

// imageSource
const imageSourceSchema = new mongoose.Schema({
    img_name: {//图片名称
        type: String,
    },
    img_path: {           //图片路径
        type: String,
        required: true
    },
    img_size: {          //图片大小
        type: Number,
    },
    img_location: {        //图片要展示的位置
        type: String,
    }
})

const imageSource = mongoose.model('image_source', imageSourceSchema)
module.exports = imageSource
