
const mongoose = require("mongoose")

// rule表的定义
const ruleSchema = new mongoose.Schema({
    rule_id: {      // 规则项id
        type: String,
        required: true,
        index: {
            unique: true,
            sparse: true
        }
    },
    rule_name: {    // 规则项名称
        type: String,
        required: true
    },
    parentId: {     // 父节点的id名称
        type: String,
        default: ''
    },
    children: {
        type: [{
            type: String
        }],
        default: []
    },
    create_time: {  // 创建时间
        type: Number,
        default: Date.now()
    },
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    }
})

const rule = mongoose.model('rule', ruleSchema, 'tempRule')
module.exports = rule
