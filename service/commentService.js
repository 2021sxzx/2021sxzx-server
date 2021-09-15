const comment = require("../model/comment")

/**
 *
 * @param condition 搜索的条件
 * @returns {*|Promise<any>}
 */
async function searchComment({idc,itemName,itemId,startTime,endTime}) {
  console.log(idc, itemName, itemId, startTime, endTime);
  if(startTime) {
    if(endTime) {

    }
  }

  let res = await comment.find({
    idc,
    itemName,
    itemId,
    startTime: {$gte: startTime},
    endTime: {$lte: endTime}
  })
  return res
}

async function saveComment(commentData) {
  try {
    let res = await comment.create(commentData)
    return res;
  } catch (e) {
    throw new Error(e.message)
  }
}

module.exports = {
  searchComment,
  saveComment
}
