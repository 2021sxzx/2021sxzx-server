const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const {showSystemFailureController, createSystemFailureController} = require('../controller/systemFailureController')
const {deleteImage} = require('../service/imageService')
const systemFailure = require('../model/systemFailure')

function setStatusCode(res, {code}) {
  if (code === 200) res.statusCode = 200 else res.statusCode = 404
}

/* 系统故障相关的路由处理. */

/**
 * 故障列表的获取
 */
router.get('/v1/failure', async (req, res) => {
  let data = await showSystemFailureController()
  setStatusCode(res, data)
  res.json(data)
})

/**
 * 提交一个系统故障
 */
router.post('/v1/create-system-failure', async ({body: data}, {end}) => {
  await createSystemFailureController(data)
  end('200')
})

let pictureNameList = []
const storage = multer.diskStorage({
  destination(req, res, cb) {
    cb(null, 'upload') // 或许可以每个故障再分一层文件夹
  }, filename({body}, {originalname}, cb) {
    const filenameArr = originalname.split('.')
    const s = String(new Date().getTime())
    const fileName = filenameArr[0] + s + '.' + filenameArr[filenameArr.length - 1]
    const fileURL = path.join(__dirname, '../upload', fileName)
    cb(null, fileName)
    pictureNameList.push({name: fileName, url: fileURL})
    body.test = pictureNameList
  }
})
const upload = multer({storage})
router.post('/v1/system-failure-picture-upload', upload.array('file', 6), async ({body}, {end, json}) => {
  const data = body.test
  body.test = []
  pictureNameList = []
  if (data === undefined) json([])
  end(JSON.stringify(data)) // 怎么清空req.test
})
/**
 * 删除一个系统故障
 */
router.post('/v1/delete-system-failure', async ({body: data}, {end}) => {
  deleteImage(data).then()
  systemFailure.deleteOne({'_id': data._id}).then(() => console.log('故障删除成功'))
  end()
})
module.exports = router