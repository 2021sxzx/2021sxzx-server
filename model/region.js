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
    parentId: {
        type: String,
        default: ''
    },
    children: {
        type: [{
            type: String
        }],
        default: []
    },
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    }
})

const region = mongoose.model('region', regionSchema, 'region')
module.exports = region