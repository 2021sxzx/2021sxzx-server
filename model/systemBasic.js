const mongoose = require('mongoose')

module.exports = mongoose.model('system_basic', new mongoose.Schema({tel: {type: String, require: true}}))