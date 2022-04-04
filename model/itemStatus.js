const mongoose = require('mongoose')

const itemStatusScheme = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    eng_name: {
        type: String,
        required: true
    },
    cn_name: {
        type: String,
        required: true
    },
    next_status: {
        type: Array,
        default: []
    }
})

const itemStatus = mongoose.model('itemStatus', itemStatusScheme, 'itemStatus')
module.exports = itemStatus