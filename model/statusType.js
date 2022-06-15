const mongoose = require('mongoose');

const statusTypeSchema = new mongoose.Schema({
  status_type: {
    type: String,
    default: '',
    require: true
  },
  status_ids: {
    type: Array,
    default: [],
    require: true
  }
});

const statusType = mongoose.model('statusType', statusTypeSchema, 'statusType');

module.exports = statusType;