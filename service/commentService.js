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

async function getAllUserComment({pageNum , score}) {
  if(pageNum === 0){
    if(score !== 0) {
      try {
        let res = await comment.find({score:{$eq:score}})
        return res;
      } catch (e) {
        throw new Error(e.message)
      }
    } else {
      try {
        let res = await comment.find()
        return res;
      } catch (e) {
        throw new Error(e.message)
      }
    }
  } else {
    if(score !== 0) {
      try {
        let res = await comment.find({score:{$eq:score}}).skip((pageNum-1)*10).limit(pageNum*10)
        return res;
      } catch (e) {
        throw new Error(e.message)
      }
    } else {
      try {
        let res = await comment.find().skip((pageNum-1)*10).limit(pageNum*10)
        return res;
      } catch (e) {
        throw new Error(e.message)
      }
    }
  }
  // try {
  //   let res = await comment.find().skip((pageNum-1)*10).limit(pageNum*10)
  //   return res;
  // } catch (e) {
  //   throw new Error(e.message)
  // }
}

async function getCommentParam() {
  try {
    let res = await comment.aggregate([
      {
        $group: {
          _id: '$score',
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort:{
          _id:1
        }
      }
    ])
    let res2 = []
    let avgScore = 0
    res.map(item => {
      let obj = {}
      obj.score = item['_id']
      obj.count = item['count']
      avgScore += item['_id'] * item['count']
      res2.push(obj)
    })
    let count = await getCommentTotal()
    avgScore /= count
    let res3 = {totalNum:count,avgScore:avgScore,scoreInfo:res2}
    return res3
  } catch (e) {
    throw new Error(e.message)
  }
}

async function getCommentTotal() {
  try {
    return await comment.find().count()
  } catch (e) {
    throw new Error(e.message)
  }
}
module.exports = {
  searchComment,
  saveComment,
  getAllUserComment,
  getCommentParam
}
