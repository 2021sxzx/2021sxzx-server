const {
    getSystemLogDetail,
    getAllSystemLog2,
    searchByCondition,
    showSystemLog
  } = require("../service/systemLogService")
  const {SuccessModel, ErrorModel} = require('../utils/resultModel');

  /**
   * 查看测试系统日志
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
   async function showSystemLogController() {
    try {
      let data = await showSystemLog();
      return new SuccessModel({msg: '获取系统日志成功', data:data});
    } catch (e) {
      return new ErrorModel({msg:e.message})
    }
  }

  const getDay=(day)=> {
    var today = new Date()
    var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day
    today.setTime(targetday_milliseconds) // 注意，这行是关键代码
    var tYear = today.getFullYear()
    var tMonth = today.getMonth()
    var tDate = today.getDate()
    tMonth = doHandleMonth(tMonth + 1)
    tDate = doHandleMonth(tDate)
    // console.log(`${tYear}/${tMonth}/${tDate}`);
    return `${tYear}-${tMonth}-${tDate}`
  }
// 获取近15天日期方法
const chart2=() =>{
  var xdata = []
  for (var i = 0; i < 15; i++) {
      xdata[i] = getDay(-i)
  }
  console.log('this.dateList',xdata)
  return xdata.reverse();
}
  function doHandleMonth(month) {
    var m = month
    if (month.toString().length === 1) {
      m = `0${month}`
    }
    return m
  }

  /**
   * 获取近十五天各天的日志数(不包括操作人)
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
  async function getSystemLog2() {
    try {
      let data = await getAllSystemLog2();
      let newData = [];
      data.forEach(function (item) {
        newData.push(item.substr(item.indexOf('[')+1,10))
      });
      var countedNames = newData.reduce((obj, name) => {
        if (name in obj) {
          obj[name]++
        } else {
          obj[name]=1
        }
        return obj
      }, {})
      const getDay=(day)=> {
        var today = new Date()
        var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day
        today.setTime(targetday_milliseconds) // 注意，这行是关键代码
        var tYear = today.getFullYear()
        var tMonth = today.getMonth()
        var tDate = today.getDate()
        tMonth = doHandleMonth(tMonth + 1)
        tDate = doHandleMonth(tDate)
        // console.log(`${tYear}/${tMonth}/${tDate}`);
        return `${tYear}-${tMonth}-${tDate}`
      }
// 获取近15天日期方法
      const chart2=() =>{
        var xdata = []
        for (var i = 0; i < 15; i++) {
          xdata[i] = getDay(-i)
        }
        console.log('this.dateList',xdata)
        var datalist = [];
        for (var k = 0; k < 15; k++) {
          if (xdata[k] in countedNames) {
            datalist.push([xdata[k], countedNames[xdata[k]]]);
          } else {
            datalist.push([xdata[k], 0]);
          }
        }
        console.log(datalist);
        return datalist.reverse();
        // return xdata.reverse();
      }
      function doHandleMonth(month) {
        var m = month
        if (month.toString().length === 1) {
          m = `0${month}`
        }
        return m
      }
      return new SuccessModel({msg: '获取系统日志成功', data:chart2()});
    } catch (e) {
      return new ErrorModel({msg:e.message})
    }
  }

  /**
   * 获取近十五天各天的事项浏览次数(不包括操作人)
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
   async function getItemBrowseCount() {
    try {
      let data = await getAllSystemLog2();
      let newData = [];
      data.forEach(function (item) {
        newData.push([item.substr(item.indexOf('[')+1,10),item.substring(item.indexOf('/'),item.indexOf("H")-1)])
      });
      var countedNames = newData.reduce((obj, name) => {
        if (name in obj) {
          obj[name]++
        } else {
          obj[name]=1
        }
        return obj
      }, {})
      var itemBrowseCount=[]
      chart2().forEach(item=>{
        let name = item+','+'/api/v1/sideBar'
        // console.log(name,':',countedNames[name])
        if(countedNames[name]) itemBrowseCount.push([name.substring(0,10),countedNames[name]])
        else itemBrowseCount.push([name.substring(0,10),0])
      })
      return new SuccessModel({msg: '获取系统日志成功', data:itemBrowseCount});
    } catch (e) {
      return new ErrorModel({msg:e.message})
    }
  }

  /**
   * 获取系统日志(包括操作人)
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
  async function getAllSystemLogDetail() {
    try {
      let data = await getSystemLogDetail();
      return new SuccessModel({msg: '获取系统日志成功', data:data});
    } catch (e) {
      return new ErrorModel({msg:e.message})
    }
  }

  /**
   * 根据条件搜索日志
   * @param searchData
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
  async function getSearchSystemLog(searchData) {
    let {myselfID,today,thisWeek} = searchData
/*    if(!myself) {
      myself = false
    }*/
    // console.log('myself:',myself)
    if(!today) {
      today = false;
    }
    if(!thisWeek) {
      thisWeek = false
    }
    try {
      let data = await searchByCondition({myselfID,today,thisWeek})
      return new SuccessModel({msg: '查询成功', data:data});
    } catch (e) {
      return new ErrorModel({msg:e.message})
    }
  }

  module.exports = {
    getSearchSystemLog,
    getAllSystemLogDetail,
    showSystemLogController,
    getSystemLog2,
    getItemBrowseCount
  }
