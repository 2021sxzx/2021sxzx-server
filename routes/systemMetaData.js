const express = require('express');
const router = express.Router();
const multer=require('multer');
const systemMetaController = require('../controller/systemMetaController');

/* 系统基础管理相关的路由处理. */
  
/**
 * 服务器端上传图片的接口
 */

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

//跨域
router.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  if(req.method=="OPTIONS") res.sendStatus(200);/*让options请求快速返回*/
  else  next();
});

//拿到网站设置中其他input等表单项
router.get('/v1/site-settings',function(req,res){
  res.send({
    WebsiteAbbreviation:"网站简称"
  });
})

//提交修改
router.post('/v1/site-settings',function(req,res){
  res.send('结束')
})

//核心设置
router.get('/v1/core-settings', systemMetaController.getCoreSetting)

router.patch('/v1/core-settings',systemMetaController.patchCoreSetting)

//日志配置
router.get('/v1/log-path', function (req, res) {
  res.send({
    systemLogPath: '/root/sxzx/sxzx/log',
    databaseLogPath: '/usr/local/mongodb/logs',
    OSLogPath: '/var/log',
    middlewareLogPath: '/usr/local/redis/log',
  })
})

//上传首页轮播图
var enter="file"
var storage = multer.diskStorage({
  destination(req,res,cb){
    cb(null,'public/imgs');
  },
  filename(req,file,cb){
    const filenameArr = file.originalname.split('.');
    // console.log("-----------req-------------")
    // console.log(req.body)
    cb(null,"banner_pc" + '.' + filenameArr[filenameArr.length-1]);
  }
});
var upload = multer({storage});
router.post(
  "/v1/backstagelogo-upload",
  // bodyParser.json({limit: '10mb'}),
  upload.single(enter),
  (req, res) => {
    console.log("-----------backstagelogo------------")
    console.log(req.file)
    if(!/(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(req.file.mimetype)){
      return res.send({
        code:400,
        msg:"文件必须为图片类型"
      })
    }
    res.send(req.file);

  //   const form = formidable();

  // form.parse(req, (err, fields, files) => {
  //   console.log("err")
  //   if (err) {
  //     console.log("err")
  //     console.log(err)
  //     next(err);
  //     return;
  //   }
  //   console.log("first")
  //   console.log({ fields, files })
  //   // res.json({ fields, files });
  // });


    // 获取文件基本信息
    // console.log('------req------');
    // console.log(req.fields);
    // console.log('------file------');
    // console.log(req);
  //   console.log('------body------');
  //  console.log(req.body);
  //  console.log(req.);
  // req.fields
  //  console.log(req.fields)
  // res.send(req.body.fileList)
  }
);

//上传首页网站logo
storage = multer.diskStorage({
  destination(req,res,cb){
    cb(null,'public/imgs');
  },
  filename(req,file,cb){
    const filenameArr = file.originalname.split('.');
    // console.log("-----------req-------------")
    // console.log(req.body)
    cb(null,"ic_logo" + '.' + filenameArr[filenameArr.length-1]);
  }
});
var websitelogoupload = multer({storage});
router.post(
  "/v1/websitelogo-upload",
  // bodyParser.json({limit: '10mb'}),
  websitelogoupload.single("file"),
  (req, res) => {
    console.log("-----------websitelogo------------")
    // console.log(req.file)
    res.send(req.file);
  }
);

//上传地址栏图标
storage = multer.diskStorage({
  destination(req,res,cb){
    cb(null,'public/imgs');
  },
  filename(req,file,cb){
    const filenameArr = file.originalname.split('.');
    cb(null,"地址栏图标" + '.' + filenameArr[filenameArr.length-1]);
  }
});
var addressbariconupload = multer({storage});
router.post(
  "/v1/addressbaricon-upload",
  addressbariconupload.single("file"),
  (req, res) => {
    res.send(req.file);
  }
);

//上传手机端logo
storage = multer.diskStorage({
  destination(req,res,cb){
    cb(null,'upload');
  },
  filename(req,file,cb){
    const filenameArr = file.originalname.split('.');
    cb(null,"手机端logo" + '.' + filenameArr[filenameArr.length-1]);
  }
});
var mobilelogoupload = multer({storage});
router.post(
  "/v1/mobilelogo-upload",
  mobilelogoupload.single("file"),
  (req, res) => {
      // console.log('!!!',req.body instanceof FormData)
      console.log(req.file)
    res.send(req.file);
  }
);

//上传二维码
storage = multer.diskStorage({
  destination(req,res,cb){
    cb(null,'public/imgs');
  },
  filename(req,file,cb){
    const filenameArr = file.originalname.split('.');
    cb(null,"二维码" + '.' + filenameArr[filenameArr.length-1]);
  }
});
var QRCodeupload = multer({storage});
router.post(
  "/v1/QRCode-upload",
  QRCodeupload.single("file"),
  (req, res) => {
    res.send(req.file);
  }
);

//基础管理
module.exports = router;