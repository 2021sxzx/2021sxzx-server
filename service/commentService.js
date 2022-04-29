const comment = require("../model/comment")
const item = require("../model/item")
// const itemRule = require("../model/itemRule")
const task = require("../model/task")
const rule = require("../model/rule")

/**
 * 保存用户的评论数据
 * @param commentData
 * @returns {Promise<EnforceDocument<unknown, {}>[]>}
 */
async function saveComment(commentData) {
  try {
    let res = await comment.create(commentData)
    return res
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 * 获取用户的评论
 * @param pageNum
 * @param score
 * @returns {Promise<*>}
 */
async function getAllUserComment({pageNum, score}) {
  try {
    if(pageNum == 0){
      if(score !== 0) {
        let res = await comment.find({score: {$eq: score}}).lean()
        return res
      } else {
        let res = await comment.find().lean()
        return res
      }
    } else {
      if(score !== 0) {
        let res = await comment.find({score: {$eq: score}}).skip((pageNum - 1) * 10).limit(pageNum * 10).lean()
        return res
      } else {
        let res = await comment.find().skip((pageNum - 1) * 10).limit(pageNum * 10).lean()
        return res
      }
    }
  } catch (e) {
    return e.message
  }
}

/**
 * 专门为解决bug写的返回全部评论数据的接口
 * @returns {Promise<*|*>}
 */
async function getAllUserComment2() {
  try {
    let res = await comment.find()
    return res
  } catch (e) {
    return e.message
  }
}

/**
 * 获取用户评价的参数
 * @returns {Promise<{scoreInfo: [], avgScore: number, totalNum: *}>}
 */
async function getCommentParam() {
  try {
    let res = await comment.aggregate([
      {
        $group: {
          _id: '$score',
          count: {
            $sum: 1
          },
        },
      },
      {
        $sort: {
          _id: 1
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
    let res3 = {totalNum: count, avgScore: avgScore, scoreInfo: res2}
    return res3
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 * 获取评论总数
 * @returns {Promise<*>}
 */
async function getCommentTotal() {
  try {
    return await comment.find().count()
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 * 查找事项对应的事项指南的方法
 * @param item_id 事项编码
 * @returns {Promise<*>}
 */
async function getTask(task_code){
  try {
    let data = await task.find({task_code: task_code},{ _id: 1, task_code: 1, task_name: 1})
    return data[0]
  } catch (e) {
    return e.message
  }
}

/**
 * 查找事项规则的方法
 * @param item_id 事项编码
 * @returns {Promise<*>}
 */
// async function getItemRule(item_id) {
//   try {
//     let itemData = await getItem(item_id)
//     let data = await itemRule.find({item_rule_id: itemData.item_rule_id})
//     return data[0]
//   } catch (e) {
//     return e.message
//   }
// }

/**
 * 查找事项的方法
 * @param item_id 事项编码
 * @returns {Promise<*>}
 */
async function getItem(item_id){
  try {
    let data = await item.find({_id: item_id})
    return data[0];
  } catch (e) {
    return e.message
  }
}

/**
 * 查找规则的方法
 * @param item_id 事项编码
 * @returns {Promise<*>}
 */
async function getRule(rule_id) {
  try {
    let data = await rule.find({rule_id: rule_id})
    return data[0]
  } catch (e) {
    return e.message
  }
}

/**
 * 将评论对应的事项的详细信息全部返回
 * @returns {Promise<*>}
 */
async function getCommentDetail({pageNum,score}) {
  try {
    let commentArr = await getAllUserComment({pageNum, score})
    for(let i=0;i<commentArr.length;i++) {
      let item_id = commentArr[i].item_id
      let item = await getItem(item_id)
      let ruleData = await getRule(item.rule_id)
      let task = await getTask(item.task_code)
      commentArr[i].rule = ruleData
      commentArr[i].task = task
    }
    return commentArr
  } catch (e) {
    return e.message
  }
}

async function getArrayCommentDetail(commentArr) {
  for(let i=0;i<commentArr.length;i++) {
    let item_id = commentArr[i].item_id
    let item = await getItem(item_id)
    let ruleData = await getRule(item.rule_id)
    let task = await getTask(item.task_code)
    commentArr[i].rule = ruleData
    commentArr[i].task = task
  }
  return commentArr
}


/**
 * 根据查询调价获取用户的评论
 * @param pageNum
 * @param score
 * @returns {Promise<*>}
 */
async function getAllUserCommentByCondition({pageNum, score, typeData, startTime, endTime, category}) {
  try {
    if(score !== 0) {
      const Reg = new RegExp(typeData, 'i')
      let res = await comment.find(
        {
          score: {$eq: score}, 
          create_time: {$gte: startTime, $lte: endTime},
          [category]: {$regex: Reg}
        }
      ).skip((pageNum - 1) * 10).limit(pageNum * 10).lean()
      return res
    } else {
      // let test = await comment.aggregate([
      //   {
      //     $lookup: {
      //       from: 'tempItems',
      //       localField: 'item_id',
      //       foreignField: '_id',
      //       as: 'testData'
      //     },
      //   }
      // ])
      // console.log(test)
      const Reg = new RegExp(typeData, 'i')
      let res = await comment.find(
        {
          create_time: {$gte: startTime, $lte: endTime},
          [category]: {$regex: Reg}
        }
      ).skip((pageNum - 1) * 10).limit(pageNum * 10).lean()
      res = getArrayCommentDetail(res)
      return res
    }
  } catch (e) {
    return e.message
  }
}

/**
 * 根据条件筛选评论数据
 * @param startTime
 * @param endTime
 * @param score
 * @param type
 * @param typeData
 * @returns {Promise<*>}
 */
async function searchByCondition({startTime, endTime, score, type, typeData, pageNum}) {
  try {
    let category;
    type = parseInt(type)
    let res;
    switch(type) {
      case 0:
        break;
      case 1:
        category = "idc"
        res = await getAllUserCommentByCondition({pageNum, score, typeData, startTime, endTime, category})
        return res
      case 2:
        category = "task_name"
        res = await getAllUserCommentByCondition({pageNum, score, typeData, startTime, endTime, category})
        return res
      case 3:
        category = "task_code"
        res = await getAllUserCommentByCondition({pageNum, score, typeData, startTime, endTime, category})
        return res
      case 4:
        category = "rule_name"
        res = await getAllUserCommentByCondition({pageNum, score, typeData, startTime, endTime, category})
        return res
    }
    // let condition = {}
    // condition.pageNum = pageNum
    // condition.score = score
    // let commentData = await getCommentDetail(condition)
    // let newCommentData = []
    // if(endTime == 0) {
    //   newCommentData = commentData.filter((currentItem, currentIndex) => {
    //     return parseInt(currentItem.create_time) >= parseInt(startTime)
    //   })
    // } else {
    //   newCommentData = commentData.filter((currentItem, currentIndex) => {
    //     return (parseInt(currentItem.create_time) >= parseInt(startTime) && parseInt(currentItem.create_time) <= parseInt(endTime))
    //   })
    // }
    // if(typeData === "") {
    //   return newCommentData
    // }
    // type = parseInt(type)
    // switch (type) {
    //   case 0:
    //     break
    //   case 1:
    //     newCommentData = newCommentData.filter((currentItem, currentIndex) => {
    //       return currentItem.idc.indexOf(typeData) !== -1
    //     })
    //     break
    //   case 2:
    //     newCommentData = newCommentData.filter((currentItem, currentIndex) => {
    //       return currentItem.task.task_name.indexOf(typeData) !== -1
    //     })
    //     break
    //   case 3:
    //     newCommentData = newCommentData.filter((currentItem, currentIndex) => {
    //       return currentItem.task.task_code.indexOf(typeData) !== -1
    //     })
    //     break
    //   case 4:
    //     newCommentData = newCommentData.filter((currentItem, currentIndex) => {
    //       return currentItem.rule.rule_name.indexOf(typeData) !== -1
    //     })
    //     break
    // }
    // return newCommentData
  } catch (e) {
    return e.message
  }
}

module.exports = {
  saveComment,
  getCommentParam,
  getCommentDetail,
  getAllUserComment2,
  searchByCondition
}
