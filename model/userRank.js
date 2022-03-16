const mongoose = require("mongoose")

const userRankSchema = new mongoose.Schema({
    user_rank: { //用户身份
        type: Number,
        required: true
    },
    rank_name: {    //用户身份的名称
        type: String,
        default: ''
    },
    check_status: {   //用户身份对应的可查看的事项状态
        type: Array,
        default: []
    },
    operate_status: {    //用户身份对应的可操作的事项状态
        type: Array,
        default: []
    }
})

const userRank = mongoose.model('userRank', userRankSchema)
module.exports = userRank
