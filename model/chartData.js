const mongoose = require('mongoose');

const chartDataSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  pv:{
    type: Number,
    required: true,
  },
  uv:{
    type: Number,
    required: true,
  },
  user_num:{
    type: Number,
    required: true,
  },
  item_num: {
    type: Number,
    required: true,
  }
})

const chartData = mongoose.model('chart_data', chartDataSchema);
module.exports = chartData;