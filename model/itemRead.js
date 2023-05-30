const mongoose = require('mongoose');

const itemReadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  daily_item_read:{
    type: Number,
    required: true,
  },
  total_item_read:{
    type: Number,
    required: true,
  },
})

const itemRead = mongoose.model('item_read', itemReadSchema);
module.exports = itemRead;