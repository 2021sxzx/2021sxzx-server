// const express = require('express');
// const router = express.Router();
// import Images from("../public/assets/index")

// function setStatusCode(res,data) {
//   if(data.code === 200) {
//     res.statusCode = 200
//   }else {
//     res.statusCode = 404
//   }
// }

// router.get('/v1/image', async (req,res,next) => {
//     let data = Images.common.ic_qrcode
//     setStatusCode(res,data)
//     res.json("data")
//   })

const express = require('express');
const router = express.Router();
// const Images =require("../public/index")

function setStatusCode(res,data) {
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
}

/**
 * show系统日志的获取
 */
 router.get('/v1/image', async (req,res,next) => {
  let data = await showSystemLogController()
  setStatusCode(res,data)
  res.json("data")
})
module.exports = router;
