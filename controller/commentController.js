const {searchComment,saveComment,getCommentDetail,getCommentParam,getAllUserComment2} = require("../service/commentService")
const {SuccessModel, ErrorModel} = require('../utils/resultModel');
/**
 * 搜索评论
 * @param condition 搜索的条件
 * @returns {Promise<*>}
 */
async function getSearch(condition) {
  let idc = condition.idc || ""
  let itemName = condition.itemName || ""
  let itemId = condition.itemId || ""
  let startTime = condition.startTime || ""
  let endTime = condition.endTime || ""
  let conditionData = {
    idc,
    itemName,
    itemId,
    startTime,
    endTime
  }
  let data = await searchComment(conditionData);
  return data;
}

/**
 * 保存用户的评论
 * @param commentData 用户的评价数据
 * @returns {Promise<Document<any, any, unknown> & Require_id<unknown>>}
 */
async function saveUserComment(commentData) {
  try {
    let data = await saveComment(commentData);
    return new SuccessModel({msg: '评论添加成功', data:data});
  } catch (e) {
    return new ErrorModel({msg:e.message})
  }
}

/**
 * 获取用户的评论
 * @param commentData 其中包括pageNum页数和score分数
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
async function getUserComments(commentData) {
  try {
    let {pageNum , score} = commentData
    if(!pageNum) {
      pageNum = 0
    }
    if(!score) {
      score = 0
    }
    let data = await getCommentDetail({pageNum , score})
    return new SuccessModel({msg: '获取评论成功', data:data});
  } catch (e) {
    return new ErrorModel({msg:e.message})
  }
}

async function getUserComments2() {
  try {
    let data = await getAllUserComment2();
    return new SuccessModel({msg: '获取评论成功', data:data});
  } catch (e) {
    return new ErrorModel({msg:e.message})
  }
}
/**
 * 获取评论的平均数和总数
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
async function getParam() {
  try {
    let data = await getCommentParam();
    return new SuccessModel({msg: '获取评论参数成功', data:data});
  } catch (e) {
    return new ErrorModel({msg:e.message})
  }
}

module.exports = {
  getSearch,
  saveUserComment,
  getUserComments,
  getParam,
  getUserComments2
}
