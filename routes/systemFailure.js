const express = require('express');
const router = express.Router();
const {
    showSystemFailureController,
    createSystemFailureController
  } = require("../controller/systemFailureController")

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
  router.post('/v1/createSystemFailure', async (req, res, next) => {
    let data = await createSystemFailureController(req.body)
    setStatusCode(res, data)
    res.json(data)
})
  module.exports = router;