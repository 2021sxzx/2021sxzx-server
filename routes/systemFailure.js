const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    showSystemFailureController,
    createSystemFailureController
  } = require("../controller/systemFailureController")
const {
    deleteImage
  } = require("../service/imageService")
const systemFailure = require("../model/systemFailure");
const imageSource = require("../model/imageSource");

  function setStatusCode(res,data) {
    if(data.code === 200) {
      res.statusCode = 200
    }else {
      res.statusCode = 404
    }
  }
  
  /* 系统故障相关的路由处理. */
  
  /**
   * 故障列表的获取
   */
   router.get('/v1/failure', async (req,res,next) => {
    let data = await showSystemFailureController()
    setStatusCode(res,data)
    res.json(data)
  })

  /**
   * 提交一个系统故障
   */
router.post('/v1/create-system-failure', async (req, res, next) => {
    let data=req.body;
    await createSystemFailureController(data);
    res.end('200');
})

var pictureNameList=[]
var storage = multer.diskStorage({
  destination(req, res, cb) {
      cb(null, 'upload');//或许可以每个故障再分一层文件夹
  },
  filename(req, file, cb) {
      const filenameArr = file.originalname.split('.');
      var s=String(new Date().getTime())
      var fileName=filenameArr[0] +s+ '.' + filenameArr[filenameArr.length - 1];
      var fileURL=path.join(__dirname,'../upload',fileName);
      cb(null, fileName);
      pictureNameList.push({name:fileName,url:fileURL})
      req.body.test=pictureNameList;
  }
});
var upload = multer({storage});
router.post('/v1/system-failure-picture-upload',  upload.array('file',6), async (req, res, next) => {
    var data=req.body.test;
    req.body.test=[];
    pictureNameList=[];
    if (data===undefined) res.json([]);
    res.end(JSON.stringify(data));//怎么清空req.test
})
  /**
   * 删除一个系统故障
   */
   router.post('/v1/delete-system-failure', async (req, res, next) => {
    let data=req.body;
    deleteImage(data);
    systemFailure.deleteOne({'_id':data._id}).then((res) =>{
      console.log('故障删除成功')
    })
    res.end()
    // setStatusCode(res, result)
    // res.json(result)
})
  module.exports = router;