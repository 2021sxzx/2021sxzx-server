const express = require('express');
const router = express.Router();
const {getSearch,saveUserComment,getUserComments,getParam} = require("../controller/commentController")

function setStatusCode(res,data) {
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
}

/* 评论相关的路由处理. */
/**
 * 评论搜索的模块
 */
router.post('/search', async (req, res, next) => {
  const condition = req.body;
  let data = await getSearch(condition);
  console.log(data);
});

/**
 * 用户评价接口
 */
router.post('/comment',async (req,res,next) => {
  let commentData = req.body;
  let data = await saveUserComment(commentData);
  setStatusCode(res,data)
  res.json(data)
})

/**
 * 用户评论数据的获取
 */
router.get('/allComment',async (req,res,next) => {
  let commentData = req.query
  let data = await getUserComments(commentData)
  setStatusCode(res,data)
  res.json(data)
})

/**
 * 用户评价的参数获取
 */
router.get('/commentParam',async (req,res,next) => {
  let data = await getParam()
  setStatusCode(res,data)
  res.json(data)
})
module.exports = router;
