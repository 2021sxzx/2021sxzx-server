const express = require('express');
const router = express.Router();
const {
    showSystemFailureController,
    createSystemFailureController
  } = require("../controller/systemFailureController")
const systemFailure = require("../model/systemFailure");

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
  router.post('/v1/create-system-failure', async (req, res, next) => {
    console.log("first")
    let data=req.body;
    console.log(data)
    let result = await createSystemFailureController(data)
    setStatusCode(res, result)
    res.json(result)
})

  /**
   * 删除一个系统故障
   */
   router.post('/v1/delete-system-failure', async (req, res, next) => {
    console.log("first")
    let data=req.body;
    console.log(data)
    systemFailure.delete.One()
    // let result = await createSystemFailureController(data)
    // setStatusCode(res, result)
    // res.json(result)
})
  module.exports = router;