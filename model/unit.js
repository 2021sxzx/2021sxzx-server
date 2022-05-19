const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  unit_name: {
    type: String,
    default: '',
    require: true
  },
  // 做一个拷贝，unit_id为_id就可
  unit_id: {
    type: String,
    default: '',
    require: true
  }
});

const unit = mongoose.model('unit', unitSchema);

module.exports = unit;