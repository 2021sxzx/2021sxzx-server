const mongoose = require('mongoose');

const unitMapDepartmentSchema = new mongoose.Schema({
  department_name: { // 部门名称对应的id
    type: Number,
    require: true
  },
  unit_name: {
    type: String,
    default: '',
    require: true
  }
});

const unitMapDepartment = mongoose.model('unitMapDepartment', unitMapDepartmentSchema);

module.exports = unitMapDepartment;