/**
 * 获取用户评价的参数
 * @returns {Promise<{scoreInfo: [], avgScore: number, totalNum: *}>}
 */
// async function getCommentParam() {
//   try {
//     let res = await comment.aggregate([
//       {
//         $group: {
//           _id: '$score',
//           count: {
//             $sum: 1,
//           },
//         },
//       },
//       {
//         $sort:{
//           _id:1
//         }
//       }
//     ])
//     let res2 = []
//     let avgScore = 0
//     res.map(item => {
//       let obj = {}
//       obj.score = item['_id']
//       obj.count = item['count']
//       avgScore += item['_id'] * item['count']
//       res2.push(obj)
//     })
//     let count = await getCommentTotal()
//     avgScore /= count
//     let res3 = {totalNum:count,avgScore:avgScore,scoreInfo:res2}
//     return res3
//   } catch (e) {
//     throw new Error(e.message)
//   }
// }

/**
 * 保存日志（未必要用）
 * @param commentData
 * @returns {Promise<EnforceDocument<unknown, {}>[]>}
 */
// async function saveComment(commentData) {
//   try {
//     let res = await comment.create(commentData)
//     return res;
//   } catch (e) {
//     throw new Error(e.message)
//   }
// }

/**
 * 获取系统日志
 * @param pageNum
 * @returns {Promise<*>}
 */
// async function getAllSystemLog({pageNum}) {
//   try {
//     if(pageNum == 0){
//         let res = await comment.find({score:{$eq:score}}).lean()
//         return res;
//     } else {
//       if(score !== 0) {
//         let res = await comment.find({score:{$eq:score}}).skip((pageNum-1)*10).limit(pageNum*10).lean()
//         return res;
//       } else {
//         let res = await comment.find().skip((pageNum-1)*10).limit(pageNum*10).lean()
//         return res;
//       }
//     }
//   } catch (e) {
//     return e.message;
//   }
// }

/**
 * 获取日志总数
 * @returns {Promise<*>}
 */
 async function getSystemLogTotal() {
  try {
    return await systemLog.find().count()
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 * 查找事项对应的事项指南的方法
 * @param item_id 事项编码
 * @returns {Promise<*>}
 */
 async function getTask(item_id){
  try {
    let itemData = await getItem(item_id)
    let data = await item.aggregate([
      {
        $lookup:{
          from:"tasks",
          pipeline:[
            {
              $match:{
                task_code:itemData.task_code
              }
            }
          ],
          as: 'task'
        }
      }
    ])
    return data[0].task[0]
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
