const mongoose = require("mongoose")
const Schema = mongoose.Schema
// comment表的定义
const itemSchema = new mongoose.Schema({
    item_name: {     //事项名称
        type: String,
        required: true
    },
    release_time: {  // 发布时间
        type: Number,
        default: 9999999999999
    },
    item_status: {   // 事项状态
        type: Number,
        default: 0
    },
    create_time: {   // 创建时间
        type: Number,
        default: Date.now()
    },
    task_code: { // 事项指南编码
        type: String,
        required: true
    },
    rule_id: {  //规则id
        type: String,
        required: true
    },
    region_code: {    //区划编码
        type: String,
        required: true
    },
    region_id: {    //区划id
        type: String,
        required: true
    }
})

const item = mongoose.model('item', itemSchema, 'tempItems')
module.exports = item
