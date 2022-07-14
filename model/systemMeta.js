const mongoose = require('mongoose');

const systemMetaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 0
  },
  data:{
    type: Object,
    required: true,
  }
})

const systemMeta = mongoose.model('system_metas', systemMetaSchema);
module.exports = systemMeta;