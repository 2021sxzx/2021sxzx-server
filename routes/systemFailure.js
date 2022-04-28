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
   * show系统日志的获取
   */
   router.get('/v1/failure', async (req,res,next) => {
    let data = await showSystemFailureController()
    setStatusCode(res,data)
    res.json(data)
  })

  /**
   * 提交一个系统故障
   */
// var JFUM = require('jfum');
// var jfum = new JFUM({
//   // minFileSize: 204800,                      // 200 kB
//   // maxFileSize: 5242880,                     // 5 mB
//   acceptFileTypes: /\.(gif|jpe?g|png)$/i    // gif, jpg, jpeg, png
// });
// router.options('/v1/create-system-failure', jfum.optionsHandler.bind(jfum));

router.post('/v1/create-system-failure', async (req, res, next) => {
    // console.log("-----------create-system-failure-------------")
    let data=req.body;
    // console.log(data)
    // console.log(data.failurePicture.fileList[0].size)
    // for (let i=0;i<data.failurePicture.fileList.length;i++){
    //   data.pictureList[i].size=data.failurePicture.fileList[i].size
      // data.pictureList[i].push('size',data.failurePicture.fileList[i].size)
    // }
    // console.log(data)
    await createSystemFailureController(data);
    res.end('200');
/*    if (req.jfum.error) {
      // req.jfum.error
        console.log('lol')
    } else {
      // Here are the uploaded files
      for (var i = 0; i < req.jfum.files.length; i++) {
        var file = req.jfum.files[i];
  
        // Check if file has errors
        if (file.errors.length > 0) {
          for (var j = 0; i < file.errors.length; i++) {
            // file.errors[j].code
            // file.errors[j].message
            console.log(file.errors[j].code,'-----',file.errors[j].message)
          }
  
        } else {
          console.log(file.name,'+++++',file.size)
          // file.field - form field name
          // file.path - full path to file on disk
          // file.name - original file name
          // file.size - file size on disk
          // file.mime - file mime type
        }
      }
    }*/
    // console.log(req.body);
    // console.log("-----------file-------------")
    // console.log(req.files)
    // console.log("-----------req-------------")
    // console.log("-----------req-------------")

    //定义文件的存放路径
    // var des_file=path.join(__dirname,'../upload','try.jpg')//+"\\"+'try.jpg'
    // console.log(des_file)
    // var file=data.failurePicture.fileList[0]
    // console.log(file)
    //将文件存入到本地服务器文件中
    // fs.readFile(file.path,function(err,data){
        // fs.writeFile(des_file,file,function(err){
        //     if(err){
        //         res.json({code:1});
        //         return
        //     }
        // })
    // })
    // res.send(data);
    // console.log(data.failurePicture.fileList[0])
    // res.send(data.failurePicture.fileList[0])
      // let result = await createSystemFailureController(data)
    // setStatusCode(res, result)
    // res.json(result)
})

var pictureNameList=[]
var storage = multer.diskStorage({
  destination(req, res, cb) {
      // console.log('1111111111')
      cb(null, 'upload');//或许可以每个故障再分一层文件夹
  },
  filename(req, file, cb) {
      const filenameArr = file.originalname.split('.');
      // console.log("-----------req1-------------")
      // console.log(file)
      // console.log("-----------file1-------------")
      // console.log(req.body)
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
    // console.log("picture")
    // console.log('req.body.test');
    // console.log(req.body);
    var data=req.body.test;
    req.body.test=[];
    pictureNameList=[];
    // console.log("data:")
    // console.log(data===undefined)
    if (data===undefined) res.json([]);
    res.end(JSON.stringify(data));//怎么清空req.test
    // res.send(data);
    // console.log(data.failurePicture.fileList[0])
    // res.send(data.failurePicture.fileList[0])
    // let result = await createSystemFailureController(data)
    // setStatusCode(res, result)
    // res.json(result)
})
  /**
   * 删除一个系统故障
   */
   router.post('/v1/delete-system-failure', async (req, res, next) => {
    // console.log("first")
    let data=req.body;
    // console.log(data);
    deleteImage(data);
    systemFailure.deleteOne({'_id':data._id}).then((res) =>{
      console.log('故障删除成功')
    })
    res.end()
    // setStatusCode(res, result)
    // res.json(result)
})
  module.exports = router;