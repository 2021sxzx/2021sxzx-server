const imageSource = require("../model/imageSource");
const express = require('express');
const router = express.Router();
const path=require('path');
const fs=require('fs');
const {getAllImage}=require('../service/imageService')
function setStatusCode(res,data) {
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
}

function setStatusCode(res,data) {
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
}

/**
 * 获取整个图片列表
 */
 router.get('/v1/image', async (req,res,next) => {
  let data = await getAllImage();
  res.json(data)
  return 'res';
})

/**
 * 存图片记录进数据库
 */
 router.get('/v1/logo_image', async (req,res,next) => {
  const data=[{name:'ic_logo',url:'http://8.134.73.52:5001/imgs/ic_logo.png'}]
  res.send(data)
})


// 返回前端
router.get('/v1/get-picture', (req, res, next) => {
  // const filePath = path.resolve(__dirname, `../public/images/${req.query.gh}.jpg`);
  // const filePath = path.resolve(__dirname, `../upload/14549661650598157606.jpg`);
  const filePath = req.query.url;
  console.log(req.query.url)
  console.log('------url--------')
  // console.log(filePath)
  // res.end(req.query);
  // res.end(filePath);
  // 给客户端返回一个文件流 type类型
  res.set( 'content-type', {"png": "image/png","jpg": "image/jpeg"} );//设置返回类型
  var stream = fs.createReadStream( filePath );
  var responseData = [];//存储文件流
  if (stream) {//判断状态
      stream.on( 'data', function( chunk ) {
        responseData.push( chunk );
      });
      stream.on( 'end', function() {
         var finalData = Buffer.concat( responseData );
         res.write( finalData );
         res.end();
      });
  }
})

module.exports = router;
