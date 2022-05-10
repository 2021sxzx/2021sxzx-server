const comment = require("../model/comment");
const item = require("../model/item");
// const itemRule = require("../model/itemRule")
const mongoose = require("mongoose");
const task = require("../model/task");
const rule = require("../model/rule");

function showIdc(str) {
  if (str.length > 0) {
    const len = str.length;
    let start = str.slice(0, 4);
    let end = str.slice(len - 4);
    start = start.padEnd(len - 4, "*");
    return start + end;
  }
}

/**
 * 保存用户的评论数据
 * @param commentData
 * @returns {Promise<EnforceDocument<unknown, {}>[]>}
 */
async function saveComment(commentData) {
  try {
    const itemData = await item.find({
      _id: mongoose.Types.ObjectId(commentData.item_id),
    });
    commentData.task_code = itemData[0].task_code;
    commentData.task_name = itemData[0].item_name;
    let res = await comment.create(commentData);
    res.idc = showIdc(res.idc);
    return res;
  } catch (e) {
    throw new Error(e.message);
  }
}

function arrayShowIdc(arr) {
  arr.forEach((item) => {
    item.idc = showIdc(item.idc);
  });
}
/**
 * 获取用户的评论
 * @param pageNum
 * @param score
 * @returns {Promise<*>}
 */
async function getAllUserComment({ pageNum, score }) {
  try {
    let total = await getCommentTotal();
    if (pageNum == 0) {
      if (score !== 0) {
        let res = await comment
          .find({ score: { $eq: score } })
          .skip(0)
          .limit(10)
          .lean();
        arrayShowIdc(res);
        const result = {
          data: res,
          total: total,
        };
        return result;
      } else {
        let res = await comment.find().skip(0).limit(10).lean();
        const result = {
          data: res,
          total: total,
        };
        arrayShowIdc(res);
        return result;
      }
    } else {
      if (score !== 0) {
        let res = await comment
          .find({ score: { $eq: score } })
          .skip((pageNum - 1) * 10)
          .limit(pageNum * 10)
          .lean();
        arrayShowIdc(res);
        const result = {
          data: res,
          total: total,
        };
        return result;
      } else {
        let res = await comment
          .find()
          .skip((pageNum - 1) * 10)
          .limit(pageNum * 10)
          .lean();
        arrayShowIdc(res);
        const result = {
          data: res,
          total: total,
        };
        return result;
      }
    }
  } catch (e) {
    return e.message;
  }
}

/**
 * 专门为解决bug写的返回全部评论数据的接口
 * @returns {Promise<*|*>}
 */
async function getAllUserComment2() {
  try {
    let res = await comment.find();
    arrayShowIdc(res);
    return res;
  } catch (e) {
    return e.message;
  }
}

/**
 * 获取用户评价的参数
 * @returns {Promise<{scoreInfo: [], avgScore: number, totalNum: *}>}
 */
async function getCommentParam({ type, typeData }) {
  try {
    const Reg = new RegExp(typeData, "i");
    let category;
    if (type) {
      type = parseInt(type);
      if (type === 1) category = "task_name";
      else category = "task_code";
      console.log(category);
    }
    const arr = [
      type
        ? {
            $match: {
              [category]: { $regex: Reg },
            },
          }
        : {
            $match: {
              $or: [
                {
                  task_code: { $regex: Reg },
                },
                { task_code: { $regex: Reg } },
              ],
            },
          },
      {
        $group: {
          _id: "$score",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];
    console.log(arr);
    let res = await comment.aggregate(arr);

    let res2 = [];
    let avgScore = 0;
    res.map((item) => {
      let obj = {};
      obj.score = item["_id"];
      obj.count = item["count"];
      avgScore += item["_id"] * item["count"];
      res2.push(obj);
    });
    let count = await getCommentTotal();
    if (type) {
      count = await comment.find({ [category]: { $regex: Reg } }).count();
    } else if (!type && typeData) {
      count = await comment
        .find({
          $or: [{ task_code: { $regex: Reg } }, { task_name: { $regex: Reg } }],
        })
        .count();
    }
    if (count !== 0) avgScore /= count;
    let res3 = { totalNum: count, avgScore: avgScore, scoreInfo: res2 };
    return res3;
  } catch (e) {
    throw new Error(e.message);
  }
}

/**
 * 获取评论总数
 * @returns {Promise<*>}
 */
async function getCommentTotal() {
  try {
    return await comment.find().count();
  } catch (e) {
    throw new Error(e.message);
  }
}

/**
 * 查找事项对应的事项指南的方法
 * @param item_id 事项编码
 * @returns {Promise<*>}
 */
async function getTask(task_code) {
  try {
    let data = await task.find(
      { task_code: task_code },
      { _id: 1, task_code: 1, task_name: 1 }
    );
    return data[0];
  } catch (e) {
    return e.message;
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
async function getItem(item_id) {
  try {
    let data = await item.find({ _id: item_id });
    return data[0];
  } catch (e) {
    return e.message;
  }
}

/**
 * 查找规则的方法
 * @param item_id 事项编码
 * @returns {Promise<*>}
 */
async function getRule(rule_id) {
  try {
    let data = await rule.find({ rule_id: rule_id });
    return data[0];
  } catch (e) {
    return e.message;
  }
}

/**
 * 将评论对应的事项的详细信息全部返回
 * @returns {Promise<*>}
 */
async function getCommentDetail({ pageNum, score }) {
  try {
    let commentArr = await getAllUserComment({ pageNum, score });
    for (let i = 0; i < commentArr.length; i++) {
      let item_id = commentArr[i].item_id;
      let item = await getItem(item_id);
      let ruleData = await getRule(item.rule_id);
      let task = await getTask(item.task_code);
      commentArr[i].rule = ruleData;
      commentArr[i].task = task;
    }
    return commentArr;
  } catch (e) {
    return e.message;
  }
}

/**
 * 根据查询调价获取用户的评论
 * @param pageNum
 * @param score
 * @returns {Promise<*>}
 */
async function getAllUserCommentByCondition({
  pageNum,
  score,
  typeData,
  startTime,
  endTime,
  category,
}) {
  try {
    // if (score !== 0) {
    //   const Reg = new RegExp(typeData, "i");
    //   const res = await comment.aggregate([
    //     {
    //       $lookup: {
    //         from: "tempItems",
    //         localField: "item_id",
    //         foreignField: "_id",
    //         as: "itemData",
    //       },
    //     },
    //     {
    //       $addFields: {
    //         itemData: { $arrayElemAt: ["$itemData", 0] },
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "tempRule",
    //         localField: "itemData.rule_id",
    //         foreignField: "rule_id",
    //         as: "rule",
    //       },
    //     },
    //     {
    //       $addFields: {
    //         rule: { $arrayElemAt: ["$rule", 0] },
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "tempTasks",
    //         //     let: { task_code_test: "task_code" },
    //         //     pipeline: [
    //         //       {
    //         //         $project: { _id: 1 },
    //         //       },
    //         //       {
    //         //         $match: {
    //         //           task_code: { $eq: "task_code_test" },
    //         //         },
    //         //       },
    //         //     ],
    //         localField: "itemData.task_code",
    //         foreignField: "task_code",
    //         as: "task",
    //       },
    //     },
    //     {
    //       $match: {
    //         score: { $eq: score },
    //         [category]: { $regex: Reg },
    //         create_time: { $gte: startTime, $lte: endTime },
    //       },
    //     },
    //     {
    //       $addFields: {
    //         task: { $arrayElemAt: ["$task", 0] },
    //       },
    //     },
    //     {
    //       $project: {
    //         _id: 1,
    //         create_time: 1,
    //         idc: 1,
    //         show_status: 1,
    //         check_status: 1,
    //         content: 1,
    //         idc_type: 1,
    //         score: 1,
    //         item_id: 1,
    //         rule: 1,
    //         "task._id": 1,
    //         "task.task_code": 1,
    //         "task.task_name": 1,
    //       },
    //     },
    //     {
    //       $skip: (pageNum - 1) * 10,
    //     },
    //     {
    //       $limit: pageNum * 10,
    //     },
    //   ]);
    //   return res;
    // } else {
    //   const Reg = new RegExp(typeData, "i");
    //   const res = await comment.aggregate([
    //     {
    //       $lookup: {
    //         from: "tempItems",
    //         localField: "item_id",
    //         foreignField: "_id",
    //         as: "itemData",
    //       },
    //     },
    //     {
    //       $addFields: {
    //         itemData: { $arrayElemAt: ["$itemData", 0] },
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "tempRule",
    //         localField: "itemData.rule_id",
    //         foreignField: "rule_id",
    //         as: "rule",
    //       },
    //     },
    //     {
    //       $addFields: {
    //         rule: { $arrayElemAt: ["$rule", 0] },
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "tempTasks",
    //         //     let: { task_code_test: "task_code" },
    //         //     pipeline: [
    //         //       {
    //         //         $project: { _id: 1 },
    //         //       },
    //         //       {
    //         //         $match: {
    //         //           task_code: { $eq: "task_code_test" },
    //         //         },
    //         //       },
    //         //     ],
    //         localField: "itemData.task_code",
    //         foreignField: "task_code",
    //         as: "task",
    //       },
    //     },
    //     {
    //       $addFields: {
    //         task: { $arrayElemAt: ["$task", 0] },
    //       },
    //     },
    //     {
    //       $match: {
    //         [category]: { $regex: Reg },
    //         create_time: { $gte: startTime, $lte: endTime },
    //       },
    //     },
    //     {
    //       $project: {
    //         _id: 1,
    //         create_time: 1,
    //         idc: 1,
    //         show_status: 1,
    //         check_status: 1,
    //         content: 1,
    //         idc_type: 1,
    //         score: 1,
    //         item_id: 1,
    //         rule: 1,
    //         "task._id": 1,
    //         "task.task_code": 1,
    //         "task.task_name": 1,
    //       },
    //     },
    //     {
    //       $skip: (pageNum - 1) * 10,
    //     },
    //     {
    //       $limit: pageNum * 10,
    //     },
    //   ]);
    //   return res;
    // }
    if (Array.isArray(category)) {
      const Reg = new RegExp(typeData, "i");
      const arr = [
        {
          score: { $eq: score },
        },
        {
          $or: [
            {
              idc: { $regex: Reg },
            },
            {
              task_code: { $regex: Reg },
            },
            {
              task_name: { $regex: Reg },
            },
          ],
        },
        { create_time: { $gte: startTime, $lte: endTime } },
      ];
      if (score === 0) arr.shift();
      let res = await comment
        .find({
          $and: arr,
        })
        .skip(0)
        .limit(10)
        .lean();
      let total = await comment
        .find({
          $and: arr,
        })
        .count();
      const result = {
        data: res,
        total: total,
      };
      return result;
    }
    if (pageNum == 1) {
      const Reg = new RegExp(typeData, "i");
      if (score !== 0) {
        let res = await comment
          .find({
            $and: [
              {
                score: { $eq: score },
              },
              {
                [category]: { $regex: Reg },
              },
              { create_time: { $gte: startTime, $lte: endTime } },
            ],
          })
          .skip(0)
          .limit(10)
          .lean();
        let total = await comment
          .find({
            $and: [
              {
                score: { $eq: score },
              },
              {
                [category]: { $regex: Reg },
              },
              { create_time: { $gte: startTime, $lte: endTime } },
            ],
          })
          .count();
        const result = {
          data: res,
          total: total,
        };
        return result;
      } else {
        console.log(34343434);
        let res = await comment
          .find({
            [category]: { $regex: Reg },
            create_time: { $gte: startTime, $lte: endTime },
          })
          .skip(0)
          .limit(10)
          .lean();
        let total = await comment
          .find({
            [category]: { $regex: Reg },
            create_time: { $gte: startTime, $lte: endTime },
          })
          .count();
        const result = {
          data: res,
          total: total,
        };
        return result;
      }
    } else {
      const Reg = new RegExp(typeData, "i");
      if (score !== 0) {
        let res = await comment
          .find({
            $and: [
              {
                score: { $eq: score },
              },
              {
                [category]: { $regex: Reg },
              },
              { create_time: { $gte: startTime, $lte: endTime } },
            ],
          })
          .skip((pageNum - 1) * 10)
          .limit(pageNum * 10)
          .lean();
        let total = await comment
          .find({
            $and: [
              {
                score: { $eq: score },
              },
              {
                [category]: { $regex: Reg },
              },
              { create_time: { $gte: startTime, $lte: endTime } },
            ],
          })
          .count();
        const result = {
          data: res,
          total: total,
        };
        return result;
      } else {
        let res = await comment
          .find({
            [category]: { $regex: Reg },
            create_time: { $gte: startTime, $lte: endTime },
          })
          .skip((pageNum - 1) * 10)
          .limit(pageNum * 10)
          .lean();
        let total = await comment
          .find({
            [category]: { $regex: Reg },
            create_time: { $gte: startTime, $lte: endTime },
          })
          .count();
        const result = {
          data: res,
          total: total,
        };
        return result;
      }
    }
  } catch (e) {
    return e.message;
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
async function searchByCondition({
  startTime,
  endTime,
  score,
  type,
  typeData,
  pageNum,
}) {
  try {
    let category;
    type = parseInt(type);
    let res;
    switch (type) {
      case 0:
        category = ["idc", "task_name", "task_code"];
        res = await getAllUserCommentByCondition({
          pageNum,
          score,
          typeData,
          startTime,
          endTime,
          category,
        });
        arrayShowIdc(res.data);
        return res;
      case 1:
        category = "idc";
        res = await getAllUserCommentByCondition({
          pageNum,
          score,
          typeData,
          startTime,
          endTime,
          category,
        });
        arrayShowIdc(res.data);
        return res;
      case 2:
        category = "task_name";
        res = await getAllUserCommentByCondition({
          pageNum,
          score,
          typeData,
          startTime,
          endTime,
          category,
        });
        arrayShowIdc(res.data);
        return res;
      case 3:
        category = "task_code";
        res = await getAllUserCommentByCondition({
          pageNum,
          score,
          typeData,
          startTime,
          endTime,
          category,
        });
        arrayShowIdc(res.data);
        return res;
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
    return e.message;
  }
}

async function getCommentDetailService(searchData) {
  const [commentData] = await comment.find({ _id: searchData._id }).lean();
  const itemData = await getItem(commentData.item_id);
  const ruleData = await getRule(itemData.rule_id);
  commentData.idc = showIdc(commentData.idc);
  commentData.rule = { rule_name: ruleData.rule_name };
  return commentData;
}

module.exports = {
  saveComment,
  getCommentParam,
  getCommentDetail,
  getAllUserComment2,
  getAllUserComment,
  searchByCondition,
  getCommentDetailService,
};
