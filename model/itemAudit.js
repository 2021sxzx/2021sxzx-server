const mongoose = require("mongoose")

const itemAuditSchema = new mongoose.Schema({
    item_id: {  //事项id
        type: String,
        required: true
    },
    item_status: {  //事项审核状态
        type: Number,
        required: true
    },
    feedback: { //事项审核的反馈意见
        type: Array,
        default: []
    }
})

const itemAudit = mongoose.model('itemAudit', itemAuditSchema)
module.exports = itemAudit
