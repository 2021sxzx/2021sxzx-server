const express = require('express')
const router = express.Router()
const multer = require('multer')
const systemMetaController = require('../controller/systemMetaController')

/* 系统基础管理相关的路由处理. */

// 元数据查看
router.get('/v1/chart-data',systemMetaController.getChartData)

// 核心设置
router.get('/v1/core-settings', systemMetaController.getCoreSetting)
router.patch('/v1/core-settings', systemMetaController.patchCoreSetting)

// 日志配置
router.get('/v1/log-path', function (req, res) {
  res.send({
    systemLogPath: '/root/sxzx/sxzx/log',
    databaseLogPath: '/usr/local/mongodb/logs',
    OSLogPath: '/var/log',
    middlewareLogPath: '/usr/local/redis/log',
  })
})

// 网站设置部分
for (let {address, filenameToStorage} of [{
  // 上传首页轮播图
  address: '/v1/backstagelogo-upload', filenameToStorage: 'banner_pc'
}, {
  // 上传首页网站logo
  address: '/v1/websitelogo-upload', filenameToStorage: 'ic_logo'
}, {
  // 上传地址栏图标
  address: '/v1/addressbaricon-upload', filenameToStorage: 'icons'
}, {
  // 上传官网二维码
  address: '/v1/official-qrcode-upload', filenameToStorage: 'qrcode_web'
}, {
  // 上传公众号二维码
  address: '/v1/wechat-official-account-qrcode-upload', filenameToStorage: 'qrcode_wechat'
}, {
  // 上传APP二维码
  address: '/v1/app-qrcode-upload', filenameToStorage: 'qrcode_app'
}]) {
  router.post(address, multer({
    storage: multer.diskStorage({
      destination(req, res, cb) {
        cb(null, 'public/imgs')
      }, filename(req, {originalname}, cb) {
        const filenameArr = originalname.split('.')
        cb(null, `${filenameToStorage}.${filenameArr[filenameArr.length - 1]}`)
      }
    }), fileFilter(req, file, cb) {
      cb(null, file.mimetype === 'image/png')
    }
  }).single('file'), (req, res) => res.sendStatus(200))
}

module.exports = router