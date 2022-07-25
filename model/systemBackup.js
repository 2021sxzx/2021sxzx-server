const mongoose = require('mongoose')

// 系统故障表的定义
const systemBackupSchema = new mongoose.Schema({
  backup_name: {type: String},
  user_name: {type: Object},
  file_size: {type: Number},
  status: {type: String},
  backup_date: {type: Date}
})

const systemBackup = mongoose.model('system_backup', systemBackupSchema)
module.exports = systemBackup
