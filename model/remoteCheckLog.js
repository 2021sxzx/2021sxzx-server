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
    }
})

const remoteCheckLog = mongoose.model('remoteCheckLog', remoteCheckLogSchema, 'remoteCheckLog')
module.exports = remoteCheckLog