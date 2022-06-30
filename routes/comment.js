/*
 * @Author: yanghong yanghong.rainbow0702@bytedance.com
 * @Date: 2022-05-05 16:30:47
 * @LastEditors: yanghong yanghong.rainbow0702@bytedance.com
 * @LastEditTime: 2022-05-10 21:30:14
 * @FilePath: /培训任务/Users/bytedance/Documents/2021sxzx-server/routes/comment.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const express = require("express");
const router = express.Router();
const {
  saveUserComment,
  getUserComments,
  getParam,
  getUserComments2,
  getSearchComment,
  getCommentDetail,
} = require("../controller/commentController");
const xss = require("xss");

function setStatusCode(res, data) {
  if (data.code === 200) {
    res.statusCode = 200;
  } else {
    res.statusCode = 404;
  }
}

/* 评论相关的路由处理. */

/**
 * 用户评价接口
 */
router.post("/v1/comment", async (req, res, next) => {
  let commentData = req.body;
  commentData.content = xss(commentData.content);
  commentData.create_time = parseInt(Date.now());
  let data = await saveUserComment(commentData);
  setStatusCode(res, data);
  res.json(data);
});

/**
 * 用户评论数据的获取
 */
router.get("/v1/comment", async (req, res, next) => {
  let commentData = req.query;
  let data = await getUserComments(commentData);
  setStatusCode(res, data);
  res.json(data);
});

router.get("/v1/allComment", async (req, res, next) => {
  let data = await getUserComments2();
  setStatusCode(res, data);
  res.json(data);
});

/**
 * 搜索功能
 */
router.post("/v1/searchComment", async (req, res, next) => {
  let searchData = req.body;
  if (searchData.typeData) {
    searchData.typeData = xss(searchData.typeData);
  }
  let data = await getSearchComment(searchData);
  setStatusCode(res, data);
  res.json(data);
});

/**
 * 用户评价的参数获取
 */
router.get("/v1/commentParam", async (req, res, next) => {
  let searchData = req.query;
  if (searchData.typeData) {
    searchData.typeData = xss(searchData.typeData);
  }
  let data = await getParam(searchData);
  setStatusCode(res, data);
  res.json(data);
});

router.get("/v1/commentDetail", async (req, res, next) => {
  let searchData = req.query;
  let data = await getCommentDetail(searchData);
  setStatusCode(res, data);
  res.json(data);
});
module.exports = router;
