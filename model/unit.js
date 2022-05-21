const mongoose = require('mongoose');

// 最后，考虑部门和单位作为一种东西来考虑是最佳的
const unitSchema = new mongoose.Schema({
  unit_name: {
    type: String,
    default: '',
    require: true
  },
  // 做一个拷贝，unit_id为_id就可
  unit_id: {
    type: Number,
    default: '',
    require: true
  },
  parent_unit: {
    type: Number,
    default: '',
    require: true
  }
});

// unitSchema.plugin(autoinc.plugin, {model: 'unit'})

const unit = mongoose.model('unit', unitSchema);

module.exports = unit;