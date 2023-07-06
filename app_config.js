/**
 * 这里配置项目代码用到的配置项，可以根据运行环境自动切换不同的配置
 * 最好不要防止config/config那里，因为那里又放了ssl证书，当然也可以把ssl证书放出来（
 */
// 日志路径，因为政务云有防篡改，所以部署环境的路径要改一下
const path = require('path')
let logPath = '', exportFilePath = ''

if (process.env.NODE_ENV === 'local') {
    // 本地
    logPath = path.join(__dirname, 'log/access.log')
    exportFilePath = path.resolve(__dirname, '../全量导出.csv')
} else if (process.env.NODE_ENV === 'development') {
    // 阿里云
    logPath = path.join(__dirname, 'log/access.log')
    exportFilePath = path.resolve(__dirname, '全量导出.csv')
} else if (process.env.NODE_ENV === 'production') {
    // 政务云
    logPath = '/root/sxzx/access.log'
    exportFilePath = '/root/sxzx/全量导出.csv'
}

module.exports = {
    logPath,
    exportFilePath
}