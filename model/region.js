const mongoose = require("mongoose")

//region表的定义
const regionSchema = new mongoose.Schema({
    create_time: {
        type: Number,
        default: Date.now()
    },
    region_code: {
        type: String,
        required: true
    },
    region_name: {
        type: String,
        required: true
    },
    region_level: {
        type: Number,
        required: true
    },
    parentId: {
        type: String,
        default: ''
    },
    children: {
        type: Array,
        default: []
    },
    creator: {      //创建人
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        department_name: {
            type: String,
            required: true
        }
    }
})

const region = mongoose.model('region', regionSchema, 'region')
module.exports = region