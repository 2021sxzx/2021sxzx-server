const mongoose = require("mongoose")

//region表的定义
const regionSchema = new mongoose.Schema({
    region_id: {
        type: String,
        required: true
    },
    region_name: {
        type: String,
        required: true
    },
    parentId: {
        type: String,
        default: ''
    }
})

const region = mongoose.model('region', regionSchema)
module.exports = region