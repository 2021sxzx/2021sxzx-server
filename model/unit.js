const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  unit_name: {
    type: String,
    default: '',
    require: true
  }
});

const unit = mongoose.model('unit', unitSchema);

module.exports = unit;