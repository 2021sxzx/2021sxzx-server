const mongoose = require('mongoose');

const sideBarSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  id: {
    type: Number,
    require: true
  },
  parent: {
    type: Number,
    default: 0
  }
})

const sideBar = mongoose.model('sideBar', sideBarSchema);
module.exports = sideBar;