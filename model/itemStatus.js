const mongoose = require("mongoose")

const itemStatusSchema = new mongoose.Schema({
    item_status: {  //事项状态
        type: Number,
        required: true
    },
    status_name: {  //事项状态名称
        type: String,
        default: ''
    }
})

const itemStatus = mongoose.model('itemStatus', itemStatusSchema)
module.exports = itemStatus
