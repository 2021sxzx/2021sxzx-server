const express = require('express');
const router = express.Router();
const {getSearch,saveUserComment} = require("../controller/commentController")

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
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
  res.json(data)
})

module.exports = router;
