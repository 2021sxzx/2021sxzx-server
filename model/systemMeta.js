const mongoose = require('mongoose');

const systemMetaSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: 0
  },
  SHBAPP: {
    type: String,
    required: true
  },
  GZSRSJGW: {
    type: String,
    required: true
  },
  ZNFWJQRYPT: {
    type: String,
    required: true
  },
  GDZWFWPT: {
    type: String,
    required: true
  },
  BDDT: {
    type: String,
    required: true,
    default: 'api.map.baidu.com'
  }
})

const systemMeta = mongoose.model('system_meta', systemMetaSchema);
module.exports = systemMeta;