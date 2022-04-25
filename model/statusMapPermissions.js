const mongoose = require('mongoose');

const statusMapPermissionsSchema = new mongoose.Schema({
  status_id: {
    type: Array,
    require: true
  },
  permission_identifier: {
    type: Number,
    require: true
  }
});

const statusMapPermissions = mongoose.model('statusMapPermissions', statusMapPermissionsSchema, 'statusMapPermissions');
module.exports = statusMapPermissions;