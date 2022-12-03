const express = require('express')
const router = express.Router()
const multer = require('multer')
const systemMetaController = require('../controller/systemMetaController')

/* 系统基础管理相关的路由处理. */

// 元数据查看
router.get('/v1/chart-data', systemMetaController.getChartData)

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
router.post('/v1/website-settings-upload', multer({
  storage: multer.diskStorage({
    destination(req, res, cb) {
      cb(null, 'public/imgs')
    }, filename(req, {fieldname, originalname}, cb) {
      cb(null, `${{
        websiteLogoFile: 'ic_logo',
        addressBarIconFile: 'icons',
        backstageLogoFile: 'banner_pc',
        officialQRCode: 'qrcode_web',
        wechatQRCodeFile: 'qrcode_wechat',
        appQRCodeFile: 'qrcode_app'
      }[fieldname]}.${originalname.split('.').slice(-1)[0]}`)
    }
  }), fileFilter(req, file, cb) {
    cb(null, file.mimetype === 'image/png')
  }
}).fields([{name: 'websiteLogoFile', maxCount: 1}, {name: 'addressBarIconFile', maxCount: 1},
  {name: 'backstageLogoFile', maxCount: 1}, {name: 'officialQRCode', maxCount: 1},
  {name: 'wechatQRCodeFile', maxCount: 1}, {name: 'appQRCodeFile', maxCount: 1}]), (req, res) => res.sendStatus(200))


router.post("/v1/user-guide-upload", multer({
  storage: multer.diskStorage({
      destination(req, res, cb) {
        cb(null, "public/xlsx");
      }, filename(req, { fieldname, originalname }, cb) {
        cb(null, `${{
          userManual: "用户手册",
        }[fieldname]}.${originalname.split(".").slice(-1)[0]}`)
      }
  }), fileFilter(req, file, cb) {
      cb(null, file.mimetype === "application/pdf");
  },
}).fields([{ name: "userManual", maxCount: 1 }]), (req, res) => res.sendStatus(200));

module.exports = router