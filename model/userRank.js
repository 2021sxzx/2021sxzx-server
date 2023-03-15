const mongoose = require('mongoose')

//用户身份
const userRankSchema = new mongoose.Schema({
    id: {   //唯一id，users表里面存的是这个
        type: Number,
        required: true
    },
    eng_name: { //英文名称，传给前端的key
        type: String,
        required: true
    },
    cn_name: {  //中文名称
        type: String,
        required: true
    },
    can_see: {  //用户身份对应可以查看的事项状态
        type: Array,
        default: []
    },
    can_operate: {  //用户身份对应的可以操作的事项状态
        type: Array,
        default: []
    },
    can_see_temp: { //用于记录临时更改某个用户的权限
        type: Object,
        default: {}
    },
    can_operate_temp: { //用于记录临时更改某个用户的权限
        type: Object,
        default: {}
    }
})

const userRank = mongoose.model('userRank', userRankSchema, 'userRank')
module.exports = userRank