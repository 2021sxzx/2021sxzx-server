const mongoose = require('mongoose');

const sideBarMapPermissionSchema = new mongoose.Schema({
  id: {
    type: Number,
    require: true
  },
  permission_identifier: {
    type: Number,
    require: true
  }
});

const sideBarMapPermission = mongoose.model('sideBarMapPermission', sideBarMapPermissionSchema);
module.exports = sideBarMapPermission;