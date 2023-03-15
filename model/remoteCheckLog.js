const mongoose = require('mongoose')

const remoteCheckLogSchema = new mongoose.Schema({
    region_code: {
        type: String,
        required: true,
        unique: true
    },
    inLocalNinRemote: {
        type: Array,
        default: []
    },
    inRemoteNinLocal: {
        type: Array,
        default: []
    },
    differences: {
        type: Array,
        default: []
    },
    handle_inLocalNinRemote:{
        type:Array,
        default:[]
    },
    handle_inRemoteNinLocal:{
        type:Array,
        default:[]
    },
    handle_differences:{
        type:Array,
        default:[]
    },
    inLocalNinRemoteGuideNames:{
        type:Array,
        default:[]
    },
    differencesGuideNames:{
        type:Array,
        default:[]
    }
})

const remoteCheckLog = mongoose.model('remoteCheckLog', remoteCheckLogSchema, 'remoteCheckLog')
module.exports = remoteCheckLog