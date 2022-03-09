const mongoose = require("mongoose")

// comment表的定义
const itemRuleSchema = new mongoose.Schema({
    create_time: {  // 创建时间
        type: Number,
        default: Date.now()
    },
    item_rule_id: {  // 事项规则编码
        type: String,
        required: true
    },
    rule_id: {      // 事项规则id
        type: String,
        default: ''
    },
    region_id: {
        type: String,
        default: ''
    }
})

const itemRule = mongoose.model('item_rule', itemRuleSchema, 'item_rule')
module.exports = itemRule
