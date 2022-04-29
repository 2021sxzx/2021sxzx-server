const express = require('express');
const router = express.Router();
const {
  saveUserComment,
  getUserComments,
  getParam,
  getUserComments2,
  getSearchComment
} = require("../controller/commentController")

function setStatusCode(res,data) {
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
}

/* 评论相关的路由处理. */

/**
 * 用户评价接口
 */
router.post('/v1/comment',async (req,res,next) => {
  let commentData = req.body;
  commentData.create_time = parseInt(Date.now())
  let data = await saveUserComment(commentData)
  setStatusCode(res, data)
  res.json(data)
})

/**
 * 用户评论数据的获取
 */
router.get('/v1/comment',async (req,res,next) => {
  let commentData = req.query
  let data = await getUserComments(commentData)
  setStatusCode(res,data)
  res.json(data)
})

router.get('/v1/allComment', async (req,res,next) => {
  let data = await getUserComments2()
  setStatusCode(res,data)
  res.json(data)
})

/**
 * 搜索功能
 */
router.post('/v1/searchComment',async (req,res,next) => {
  let searchData = req.body
  let data = await getSearchComment(searchData)
  setStatusCode(res,data)
  res.json(data)
})

/**
 * 用户评价的参数获取
 */
router.get('/v1/commentParam',async (req,res,next) => {
  let data = await getParam()
  setStatusCode(res,data)
  res.json(data)
})
module.exports = router
