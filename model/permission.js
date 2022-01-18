const mongoose = require("mongoose")

const permissionSchema = new mongoose.Schema({
  permission: {
    type: String,
    require: true
  },
  permission_identifier: {
    type: Number,
    require: true
  }
})

const permission = mongoose.model('permission', permissionSchema)

module.exports = permission