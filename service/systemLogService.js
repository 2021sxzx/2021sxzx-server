const systemLog = require("../model/systemLog");
const users = require("../model/users");
const fs = require('fs')
const { getUserById } = require('../service/userManagementService');
const { start } = require("repl");
//与数据库默认的_id进行匹配
var ObjectID = require('mongoose').ObjectId;

/**
 * 请求操作映射表
 * @returns {Promise<*|*>}
 */
function chargeTypeChange(value) {
  // TODO: 后续补全操作映射表
  var chargeTypeGroup = {
      "GET /api/v1/allSystemLog":"查询所有日志",
      "GET /api/v1/allSystemLogDetail":"查询详细日志",
      "POST /api/v1/getUserRank":"获取用户评论等级",
      "GET /api/v1/getRuleTree/":"获取事项规则树",
      "GET /api/v1/getItemStatusScheme":"获取事项规则数据集",
      "POST /api/v1/getItems":"获取事项规则",
      "POST /api/v1/login":"用户登录",
      "POST /api/v1/sideBar":"获取侧边栏",
      "GET /api/v1/getRegionTree/":"获取规则树",
  };
  return chargeTypeGroup[value];
}

/**
 * 查找操作人id对应的用户名的方法
 * @param id 操作人的id
 * @returns {Promise<*>}
 */

/**
 * 读取日志内容
 * @returns {Promise<*|*>}
 */
 async function showSystemLog() {
  try {
    var data = fs.readFileSync('log/access.log');
    data = data.toString().split("\n");
    var dataArray = []
    var user = ""//objectkey for循环

    var dataLength=data.length;
    for (let i = 0; i < dataLength; i++){
      // 系统id我们弄为000
      user = await getUserById(data[i].slice(0,data[i].indexOf(":")-1))
      if (!user) {
        continue
      }
      dataArray.push({
        log_id: i,
        create_time: data[i].substr(data[i].indexOf("[") + 1, 19), //! 做修改，不要将[.]包被进来
        content: chargeTypeChange(data[i].slice(data[i].indexOf("\"") + 1, data[i].indexOf("H") - 1)),
        user_name: user.user_name,
        idc: user.account,
        _id: data[i].slice(0, data[i].indexOf(":") - 1)
      });
    }
    // 做一个筛选
    return dataArray.filter(item => !!item.content);
  } catch (e) {
    return "showSystemLog:" + e.message;
  }
}
/**
 * 专门为系统元数据写的返回全部系统日志（不包括操作人）的接口
 * @returns {Promise<*|*>}
 */
 async function getAllSystemLog2() {
  try {
    var data = fs.readFileSync('log/access.log');
    data=data.toString().split("\n");
    return data;
  } catch (e) {
    return e.message;
  }
}

/**
 * 将系统日志对应的操作人的详细信息全部返回
 * @returns {Promise<*>}
 */
async function getSystemLogDetail() {
  try {
    let systemLogArr = await getAllSystemLog2();
    for (let i = 0; i < systemLogArr.length; i++) {
      let item_id = systemLogArr[i].idc;
      let userName = await getUserName(item_id);
      systemLogArr[i].user_name = userName.user_name;
    }
    return systemLogArr;
  } catch (e) {
    return e.message;
  }
}

/**
 * 根据条件筛选评论数据
 * @param myself
 * @param today
 * @param thisWeek
 * @returns {Promise<*>}
 */
async function searchByCondition({ myselfID, today, thisWeek }) {
  try {
    let condition = {};
    condition.pageNum = 0;
    let systemLogData = await showSystemLog();
    let newSystemLogData = [];
    if (myselfID === '' && today === false && thisWeek === false) {
      return systemLogData
    }
    if (myselfID) {
      newSystemLogData = systemLogData.filter((currentItem) => {
        return currentItem._id === myselfID;
      });
    }
    if (today === true) {
      let d = new Date();
      newSystemLogData = systemLogData.filter((currentItem) => {
        return currentItem.create_time.substring(0, 10) === d.toJSON().substring(0,10);
      });
    }
    if (thisWeek === true) {
      let date1 = new Date();
      let w = date1.getDay(); //获取一下今天是周几
      let delta1 = 1 - w; //算算差几天到周一
      date1.setDate(date1.getDate() + delta1);
      date1 = date1.toJSON();
      date1 = date1.substring(0, 10);
      let date7 = new Date();
      let delta7 = 7 - w; //算算差几天到周日
      date7.setDate(date7.getDate() + delta7);
      date7 = date7.toJSON();
      date7 = date7.substring(0, 10);
      let date1number = parseInt(date1.replace(/-/g, ""));
      let date7number = parseInt(date7.replace(/-/g, ""));
      newSystemLogData = systemLogData.filter((currentItem) => {
        return (
          date1number <=
            parseInt(
              currentItem.create_time.substring(0, 10).replace(/-/g, "")
            ) &&
          parseInt(
            currentItem.create_time.substring(0, 10).replace(/-/g, "")
          ) <= date7number
        );
      });
    }
    return newSystemLogData
  } catch (e) {
    return e.message;
  }
}

/**
 * 根据条件高级查询日志
 * @param searchData
 * @returns {Promise<*>}
 */
async function searchByAdvancedCondition(searchData) {
  const ID = '账号';
  const NAME = '操作人';
  const DESCRIPTION = '操作描述';
  let {searchValue, searchType, startTime, endTime} = searchData;
  if (!searchValue) searchValue = '.';
  if (!searchType) searchType = ID;
  if (!startTime) startTime = '0';
  if (!endTime) startTime = '3';
  if (startTime > endTime) {
    let temp = null;
    temp = endTime;
    endTime = startTime;
    startTime = temp;
  }

  const reg = new RegExp(searchValue, 'i');
  try {
    const allLog = await showSystemLog();
    const res = allLog.filter(item => {
      return (
        (searchType == ID && reg.test(item.idc)) || 
        (searchType == NAME && reg.test(item.user_name)) || 
        (searchType == DESCRIPTION && reg.test(item.content))
      ) && (
        (startTime <= item.create_time.split('T')[0]) &&
        (endTime >= item.create_time.split('T')[0])
      )
    })
    return res;
  } catch (e) {
    return e.message;
  }
}


module.exports = {
  getSystemLogDetail,
  getAllSystemLog2,
  searchByCondition,
  searchByAdvancedCondition,
  showSystemLog,
};
