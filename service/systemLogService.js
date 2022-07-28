const fs = require('fs')
const {getUserById} = require('../service/userManagementService')

/**
 * 请求操作映射表
 * @returns {Promise<*|*>}
 */
function chargeTypeChange(value) {
  const chargeTypeGroup = {
    'GET /api/v1/show/': '查询日志',
    'POST /api/v1/set-tel': '修改咨询电话',
    'POST /api/v1/add-hot-key': '增加热词',
    'POST /api/v1/delete-hot-key': '删除热词',
    'GET /api/v1/handle-backup': '手动备份数据库',
    'POST /api/v1/delete-system-backup': '删除数据库备份',
    'GET /api/v1/mongo-backup': '查询数据库备份',
    'POST /api/v1/change-backup-cycle': '修改数据库自动备份时间',
    'POST /api/v1/website-settings-upload': '修改网站设置',
    'PATCH /api/v1/core-settings': '修改网站核心设置',
    'POST /api/v1/create-system-failure': '添加故障',
    'POST /api/v1/delete-system-failure': '删除故障'
  }
  return chargeTypeGroup[value]
}

/**
 * 读取日志内容
 * @returns {Promise<*|*>}
 */
async function showSystemLog() {
  try {
    let data = fs.readFileSync('log/access.log')
    data = data.toString().split('\n')
    const dataArray = []
    let user = ''
    const dataLength = data.length
    for (let i = 0; i < dataLength; i++) {
      // 系统id我们弄为000
      user = await getUserById(data[i].slice(0, data[i].indexOf(':') - 1))
      // 进行过滤，只留系统管理员
      if (!user && user.role_name !== '系统管理员')
        continue
      dataArray.push({
        log_id: i,
        create_time: data[i].slice(data[i].indexOf('[') + 1, data[i].indexOf('[') + 20), //! 做修改，不要将[.]包被进来
        content: chargeTypeChange(data[i].slice(data[i].indexOf('"') + 1, data[i].indexOf('H') - 1)),
        user_name: user.user_name,
        idc: user.account,
        _id: data[i].slice(0, data[i].indexOf(':') - 1)
      })

    }
    // 做一个筛选
    return dataArray.filter(item => !!item.content)
  } catch (e) {
    return 'showSystemLog:' + e.message
  }
}

/**
 * 专门为系统元数据写的返回全部系统日志（不包括操作人）的接口
 * @returns {Promise<*|*>}
 */
async function getAllSystemLog2() {
  try {
    let data = fs.readFileSync('log/access.log')
    data = data.toString().split('\n')
    return data
  } catch (e) {
    return e.message
  }
}

/**
 * 根据条件筛选评论数据
 * @param myself
 * @param today
 * @param thisWeek
 * @returns {Promise<*>}
 */
async function searchByCondition({myselfID, today, thisWeek}) {
  try {
    let condition = {}
    condition.pageNum = 0
    let systemLogData = await showSystemLog()
    let newSystemLogData = []
    if (myselfID === '' && today === false && thisWeek === false) {
      return systemLogData
    }
    if (myselfID) {
      newSystemLogData = systemLogData.filter((currentItem) => {
        return currentItem._id === myselfID
      })
    }
    if (today === true) {
      let d = new Date()
      newSystemLogData = systemLogData.filter((currentItem) => {
        return currentItem.create_time.substring(0, 10) === d.toJSON().substring(0, 10)
      })
    }
    if (thisWeek === true) {
      let date1 = new Date()
      let w = date1.getDay() //获取一下今天是周几
      let delta1 = 1 - w //算算差几天到周一
      date1.setDate(date1.getDate() + delta1)
      date1 = date1.toJSON()
      date1 = date1.substring(0, 10)
      let date7 = new Date()
      let delta7 = 7 - w //算算差几天到周日
      date7.setDate(date7.getDate() + delta7)
      date7 = date7.toJSON()
      date7 = date7.substring(0, 10)
      let date1number = parseInt(date1.replace(/-/g, ''))
      let date7number = parseInt(date7.replace(/-/g, ''))
      newSystemLogData = systemLogData.filter((currentItem) => {
        return (
          date1number <=
          parseInt(
            currentItem.create_time.substring(0, 10).replace(/-/g, '')
          ) &&
          parseInt(
            currentItem.create_time.substring(0, 10).replace(/-/g, '')
          ) <= date7number
        )
      })
    }
    return newSystemLogData
  } catch (e) {
    return e.message
  }
}

/**
 * 根据条件高级查询日志
 * @param searchData
 * @returns {Promise<*>}
 */
async function searchByAdvancedCondition(searchData) {
  const ID = '账号'
  const NAME = '操作人'
  const DESCRIPTION = '操作描述'
  let {searchValue, searchType, startTime, endTime} = searchData
  if (!searchValue) searchValue = '.'
  if (!searchType) searchType = ID
  if (!startTime) startTime = '0'
  //bug  原代码：
  // if (!endTime) startTime = '3';
  if (!endTime) endTime = '3'

  if (startTime > endTime) {
    let temp
    temp = endTime
    endTime = startTime
    startTime = temp
  }

  const reg = new RegExp(searchValue, 'i')
  try {
    const allLog = await showSystemLog()
    // console.log("高级查询filter前的数据:",allLog)
    return allLog.filter(item => {
      return (
        (searchType === ID && reg.test(item.idc)) ||
        (searchType === NAME && reg.test(item.user_name)) ||
        (searchType === DESCRIPTION && reg.test(item.content))
      ) && (
        (startTime <= item.create_time.split('T')[0]) &&
        (endTime >= item.create_time.split('T')[0])
      )
    })
  } catch (e) {
    return e.message
  }
}


module.exports = {
  getAllSystemLog2,
  searchByCondition,
  searchByAdvancedCondition,
  showSystemLog,
}
