const express = require('express');
const router = express.Router();
const multer=require('multer');
const bodyParser = require('body-parser');
const path = require('path');
router.use(bodyParser.urlencoded());
router.use(bodyParser.json());
function setStatusCode(res,data) {
    if(data.code === 200) {
      res.statusCode = 200
    }else {
      res.statusCode = 404
    }
  }

    /* 系统基础管理相关的路由处理. */
  
  /**
   * 服务器端上传图片的接口
   */
  //  const storage = multer.diskStorage({
  //   destination(req,res,cb){
  //     cb();
  //   },
  //   filename(req,file,cb){
  //     const filenameArr = file.originalname.split('.');
  //     cb(null,Date.now() + '-' + filenameArr[filenameArr.length-1]);
  //   }
  // });
   router.post('/v1/upload1', async (req,res,next) => {
    // setStatusCode(res,data)
    res.json("reqtest")
  })
/**
 *  上传excel文件测试
 */
 var enter="file"
var storage = multer.diskStorage({
  destination(req,res,cb){
    cb(null,'upload');
  },
  filename(req,file,cb){
    const filenameArr = file.originalname.split('.');
    cb(null,"" + '.' + filenameArr[filenameArr.length-1]);
  }
});
var upload = multer({storage});

// var enter;var storage;var upload;
// router.use("/v1/upload", (req, res, next) => {
//   console.log("first use");
//   enter = req.enter;
//   storage = multer.diskStorage({
//     destination(req, res, cb) {
//       cb(null, "upload");
//     },
//     filename(req, file, cb) {
//       const filenameArr = file.originalname.split(".");
//       cb(null, enter + "." + filenameArr[filenameArr.length - 1]);
//     },
//   });
//   upload = multer({ storage });
//   next();
// });


router.post(
  "/v1/upload",
  upload.single(enter),
  (req, res) => {
    // 获取文件基本信息
   console.log(req.body);
   console.log(req.body.enter);
   console.log(req.body.test);
  //  console.log(req.file);
  //  console.log(req.getParameter())
   res.send(req.file);
  }
);

//  router.post(
//    "/v1/upload",
//    multer({
//      dest: "upload",filename:"testname"
//    }).single("file"),
//    (req, res) => {
//     //  res.header("Access-Control-Allow-Origin", "*");
//     //  res.header("Access-Control-Allow-Headers", "Content-Type");
//     //  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
//      // 获取文件基本信息
//     //  req.file.filename=req.file.originalname;
//      console.log(req.file.originalname);
//      res.send(req.file);
//    }
//  );
// var myself=express.Router()
// var App=express()
//测试中间件
// myself.use(function(req, res,next){
//   console.log("use")
//   next()
// })
// router.use('/v1/use',async(req,res,next)=>{
//   req.enter="file"
//   const storage = multer.diskStorage({
//     destination(req,res,cb){
//       cb(null,'upload');
//     },
//     filename(req,file,cb){
//       const filenameArr = file.originalname.split('.');
//       cb(null,req.enter + '.' + filenameArr[filenameArr.length-1]);
//     }
//   });
//   req.upload=multer({storage});
//   next()
// })
// router.post('/v1/use',req.upload.single(req.enter),async(req,res)=>{
//   console.log(req.body)
//   // res.send(req.);
// })
// myself.get('/',async(req,res,next)=>{
//   res.json("index");
// })
// App.use('/use',myself)

//其他input等表单项
router.get('/v1/basic',function(req,res){
  res.send({
    WebsiteAbbreviation:"网站简称",
    WebsiteDomainName:"xxx.domain",
    CopyrightInformation:"",
    RecordNumber:"",
    ServiceHotline:"",
    Address:"",
    Disclaimers:""
  })
})

//基础管理
  module.exports = router;