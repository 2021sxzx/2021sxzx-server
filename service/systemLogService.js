const systemLog = require("../model/systemLog");
const users = require("../model/users");
const fs = require('fs')

/**
 * 请求操作映射表
 * @returns {Promise<*|*>}
 */
function chargeTypeChange(value) {
  var chargeTypeGroup = {
      "GET /api/v1/allSystemLog":"查询所有日志",
      "GET /api/v1/allSystemLogDetail":"查询详细日志",
  };
  return chargeTypeGroup[value];
};

/**
 * 看看log是什么
 * @returns {Promise<*|*>}
 */
 async function showSystemLog() {
  try {
    // let data = fs.readFile('2021sxzx-server\service\test.txt')
    // return "data";
    // fs.readFile('service/test.txt',function(err,data){
    //   return "data";
    //   if (err){
    //     return "data";
    //     console.error(err);
    //   }
    //   else{
    //     return "data";
    //   }
    // })
    var data = fs.readFileSync('log/access.log');
    data=data.toString().split("\n");
    var dataArray=[]
    data.forEach(function(item,index){
      dataArray.push({log_id:index,create_time:item.substr(item.indexOf("[")+1,20),content:chargeTypeChange(item.slice(item.indexOf("\"")+1,item.indexOf("H")-1)),user_name:'zyk',idc:'133'})
    })
    return (dataArray);
  } catch (e) {
    return "showSystemLog:"+e.message;
  }
}
/**
 * 专门为解决bug写的返回全部系统日志（不包括操作人）的接口
 * @returns {Promise<*|*>}
 */
 async function getAllSystemLog2() {
  try {
    let res = await systemLog.find();
    return res;
  } catch (e) {
    return e.message;
  }
}

/**
 * 查找操作人idc对应的用户名的方法
 * @param idc 操作人的证件号
 * @returns {Promise<*>}
 */
async function getUserName(item_id) {
  try {
    let data = await users.find({ idc: item_id });
    return data[0];
    // return data
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
async function searchByCondition({ myself, today, thisWeek }) {
  try {
    let condition = {};
    condition.pageNum = 0;
    let systemLogData = await getSystemLogDetail();
    let newSystemLogData = [];
    // thisWeek=true;
    // myself=true;
    // return { myself, today, thisWeek }
    if (myself === false && today === false && thisWeek === false) {
      return systemLogData
      // return [{idc:"001"}]
  //     TimeZone time = TimeZone.getTimeZone("Etc/GMT-8");  //转换为中国时区

  // TimeZone.setDefault(time);
  //     var d = new Date();
  //     return d;
  //     newSystemLogData = systemLogData.filter((currentItem) => {
  //       return currentItem.create_time.substring(0, 10) == d.toJSON().substring(0,10);
  //     });
    }
    // else {
    //   return (newSystemLogData = systemLogData.filter((currentItem) => {
    //     return currentItem.user_name === "张毅";
    //   }));
    // }
    if (myself === true) {
      return (newSystemLogData = systemLogData.filter((currentItem) => {
        return currentItem.user_name === "张毅";
      }));
    }
    if (today === true) {
      let d = new Date();
      newSystemLogData = systemLogData.filter((currentItem) => {
        return currentItem.create_time.substring(0, 10) == d.toJSON().substring(0,10);
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
    // if (myself == false) {
    //   if (today == false) {
    //     if (thisWeek ==false) {
    //       return (newSystemLogData = systemLogData.filter((currentItem) => {
    //         return currentItem.user_name === "张奕凯";
    //       }));
    //     }
    //   }
    // } else {
    //   return newSystemLogData
    // }
    // if (myself == false) {
    //   if (today == false) {
    //     if (thisWeek == false) {
    //       return "systemLogData";
    //     }else {
    //       return "only week"
    //     }
    //   }
    //   else {
    //     return "only today"
    //   }
    // }else{
    //   return "myself"
    // }
    // } else if (myself) {
    //   return newSystemLogData = systemLogData.filter((currentItem) => {
    //     return currentItem.user_name === "张毅";
    //   });
    // } else if (today==true) {
    //   let d = new Date();
    //   return d;
      // return newSystemLogData = systemLogData.filter((currentItem) => {
      //   return (
      //     currentItem.create_time.substring(0, 10) ==
      //     d.toJSON().substring(0, 10)
      //   );
      // });
    // } else {
    //   return newSystemLogData = systemLogData.filter((currentItem) => {
    //     return currentItem.user_name === "张奕凯";
    //   });
    // }
  } catch (e) {
    return e.message;
  }
}

module.exports = {
  getSystemLogDetail,
  getAllSystemLog2,
  searchByCondition,
  showSystemLog,
};
