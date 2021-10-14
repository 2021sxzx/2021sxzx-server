const comment = require("../model/comment")
const item = require("../model/item")
const itemRule = require("../model/itemRule")
const itemGuide = require("../model/itemGuide")
const rule = require("../model/rule")
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

/**
 * 保存用户的评论数据
 * @param commentData
 * @returns {Promise<EnforceDocument<unknown, {}>[]>}
 */
async function saveComment(commentData) {
  try {
    let res = await comment.create(commentData)
    return res;
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
async function getAllUserComment({pageNum , score}) {
  let res = await comment.find().limit(10).lean()
  return res;
  if(pageNum == 0){
    if(score !== 0) {
      try {
        let res = await comment.find({score:{$eq:score}}).lean()
        return res;
      } catch (e) {
        throw new Error(e.message)
      }
    } else {
      try {
        let res = await comment.find().lean()
        return res;
      } catch (e) {
        throw new Error(e.message)
      }
    }
  } else {
    if(score !== 0) {1
      try {
        let res = await comment.find({score:{$eq:score}}).skip((pageNum-1)*10).limit(pageNum*10).lean()
        return res;
      } catch (e) {
        throw new Error(e.message)
      }
    } else {
      try {
        let res = await comment.find().skip((pageNum-1)*10).limit(pageNum*10).lean()
        return res;
      } catch (e) {
        throw new Error(e.message)
      }
    }
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
async function getItemGuide(item_id){
  try {
    let itemData = await getItem(item_id)
    let data = await item.aggregate([
      {
        $lookup:{
          from:"item_guides",
          pipeline:[
            {
              $match:{
                item_guide_id:itemData.item_guide_id
              }
            }
          ],
          as: 'item_guide'
        }
      }
    ])
    return data[0].item_guide[0]
  } catch (e) {
    return e.message
  }
}

/**
 * 查找事项规则的方法
 * @param item_id 事项编码
 * @returns {Promise<*>}
 */
async function getItemRule(item_id) {
  try {
    let itemData = await getItem(item_id)
    let data = await item.aggregate([
      {
        $lookup:{
          from:"item_rules",
          pipeline:[
            {
              $match:{
                create_time:itemData.item_rule_id
              }
            }
          ],
          as: 'item_rule'
        }
      }
    ])
    return data[0].item_rule[0]
  } catch (e) {
    return e.message
  }
}

/**
 * 查找事项的方法
 * @param item_id 事项编码
 * @returns {Promise<*>}
 */
async function getItem(item_id){
  try {
    let data = await item.find({item_id})
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
async function getRule(item_id) {
  try {
    let itemRuleData = await getItemRule(item_id)
    let data = await rule.find({rule_id:itemRuleData.rule_id})
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
      let ruleData = await getRule(item_id)
      let item_guide = await getItemGuide(item_id)
      let item_rule = await getItemRule(item_id)
      commentArr[i].rule = ruleData
      commentArr[i].item_guide = item_guide
      commentArr[i].item_rule = item_rule
    }
    return commentArr
  } catch (e) {
    return e.message
  }
}

module.exports = {
  searchComment,
  saveComment,
  getCommentParam,
  getCommentDetail
}
