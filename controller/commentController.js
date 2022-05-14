const {
  saveComment,
  getCommentParam,
  getAllUserComment2,
  getAllUserComment,
  searchByCondition,
  getCommentDetailService,
} = require("../service/commentService");
const { SuccessModel, ErrorModel } = require("../utils/resultModel");
/**
 * 保存用户的评论
 * @param commentData 用户的评价数据
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
async function saveUserComment(commentData) {
  try {
    let data = await saveComment(commentData);
    return new SuccessModel({ msg: "评论添加成功", data: data });
  } catch (e) {
    return new ErrorModel({ msg: e.message });
  }
}

/**
 * 获取用户的评论
 * @param commentData 其中包括pageNum页数和score分数
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
async function getUserComments(commentData) {
  try {
    let { pageNum, score } = commentData;
    if (!pageNum) {
      pageNum = 0;
    }
    if (!score) {
      score = 0;
    }
    let data = await getAllUserComment({ pageNum, score });
    return new SuccessModel({ msg: "获取评论成功", data: data });
  } catch (e) {
    return new ErrorModel({ msg: e.message });
  }
}

async function getUserComments2() {
  try {
    let data = await getAllUserComment2();
    return new SuccessModel({ msg: "获取评论成功", data: data });
  } catch (e) {
    return new ErrorModel({ msg: e.message });
  }
}
/**
 * 获取评论的平均数和总数
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
async function getParam(searchData) {
  try {
    let data = await getCommentParam(searchData);
    return new SuccessModel({ msg: "获取评论参数成功", data: data });
  } catch (e) {
    return new ErrorModel({ msg: e.message });
  }
}

/**
 * 根据条件搜索评价
 * @param searchData
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
async function getSearchComment(searchData) {
  let { startTime, endTime, score, type, typeData, pageNum } = searchData;
  if (!startTime) {
    startTime = "0";
  }
  if (!endTime) {
    endTime = Number.MAX_SAFE_INTEGER;
  }
  if (!score) {
    score = 0;
  }
  if (!type) {
    type = 0;
  }
  if (!typeData) {
    typeData = "";
  }
  if (!pageNum) {
    pageNum = 1;
  }
  try {
    let data = await searchByCondition({
      startTime,
      endTime,
      score,
      type,
      typeData,
      pageNum,
    });
    return new SuccessModel({ msg: "查询成功", data: data });
  } catch (e) {
    return new ErrorModel({ msg: e.message });
  }
}

async function getCommentDetail(searchData) {
  try {
    let data = await getCommentDetailService(searchData);
    return new SuccessModel({ msg: "查询成功", data: data });
  } catch (e) {
    return new ErrorModel({ msg: e.message });
  }
}

module.exports = {
  saveUserComment,
  getUserComments,
  getParam,
  getUserComments2,
  getSearchComment,
  getCommentDetail,
};
