const fs = require('fs')
const {getUserById} = require('../service/userManagementService')
const {getMemory} = require('./systemResourceService')

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
        'POST /api/v1/delete-system-failure': '删除故障',
        'POST /api/v1/login': '用户登录',
        'POST /api/v1/logout': '用户退出',
        'POST /api/v1/user/': '创建用户',
        'POST /api/v1/batchImportUser': '批量创建用户',
        'DELETE /api/v1/user/': '删除用户',
        'PATCH /api/v1/user/': '修改用户信息',
        'MemoryAlert': '内存告警'
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
        let dataArray = []
        let user = ''
        const dataLength = data.length
        for (let i = 0; i < dataLength; i++) {
            // 系统id我们弄为000
            user = await getUserById(data[i].slice(0, data[i].indexOf(':') - 1))
            // 进行过滤，只留系统管理员
            if (!user && user.role_name !== '系统管理员')
                continue
            // 针对登录情况进行检查，只记录登录成功的情况
            const content = chargeTypeChange(data[i].slice(data[i].indexOf('"') + 1, data[i].indexOf('HTTP') - 1))
            if (content !== '用户登录' || data[i].search('/login HTTP/1.1" 200') !== -1)
                dataArray.push({
                    create_time: data[i].slice(data[i].indexOf('[') + 1, data[i].indexOf(']')),
                    content,
                    user_name: user.user_name,
                    idc: user.account,
                    _id: data[i].slice(0, data[i].indexOf(':') - 1),
                    ip: data[i].split(' ')[1]
                })
        }
        // 做一个筛选
        dataArray = dataArray.filter(item => item.content)
        // 建立编号
        for (let i = 0; i < dataArray.length; ++i) dataArray[i].log_id = i + 1
        return dataArray
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
            const d = new Date()
            const day = d.getDate()
            const month = d.getMonth() + 1
            const year = d.getFullYear()
            newSystemLogData = systemLogData.filter((currentItem) => {
                return currentItem.create_time.split(' ')[0] === `${year}/${month}/${day}`
            })
        }
        if (thisWeek === true) {
            let date1 = new Date()
            let w = date1.getDay() //获取一下今天是周几
            let delta1 = 1 - w //算算差几天到周一
            date1.setDate(date1.getDate() + delta1)
            date1 = date1.toJSON()
            date1 = date1.split('T')[0]
            console.log(date1)
            let date7 = new Date()
            let delta7 = 7 - w //算算差几天到周日
            date7.setDate(date7.getDate() + delta7)
            date7 = date7.toJSON()
            date7 = date7.split('T')[0]
            console.log(date7)
            let date1number = parseInt(date1.replace(/[-\/]/g, ''))
            let date7number = parseInt(date7.replace(/[-\/]/g, ''))

            newSystemLogData = systemLogData.filter((currentItem) => {
                let itemDate=currentItem.create_time.split(' ')[0]
                let itemMonth=currentItem.create_time.split('/')[1]
                let itemDay=currentItem.create_time.split('/')[2]
                if(itemMonth.length<2){
                    itemDate=itemDate.replace(itemMonth,'0'+itemMonth)
                }
                if(itemDay.length<2){
                    itemDate=itemDate.replace(itemDay,'0'+itemDay)
                }
                return (
                    date1number <=
                    parseInt(
                        itemDate.replace(/[-\/]/g, '')
                    ) &&
                    parseInt(
                        itemDate.replace(/[-\/]/g, '')
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

    // TODO: 这个'0'和'3'是干什么的？？
    if (!startTime) startTime = '0'
    //bug  原代码：
    // if (!endTime) startTime = '3';
    if (!endTime) endTime = '3'

    // 数字化和格式化日期
    let numStartTime =  parseInt(startTime.replace(/[-\/]/g, ''))
    let numEndTime = parseInt(endTime.replace(/[-\/]/g, ''))

    // 如果开始和结束时间反过来了就交换
    if (numStartTime > numEndTime) {
        let temp
        temp = numEndTime
        numEndTime = numStartTime
        numStartTime = temp
    }

    const reg = new RegExp(searchValue, 'i')
    try {
        const allLog = await showSystemLog()

        return allLog.filter(item => {
            const itemTime = parseInt(item.create_time.split(/[T ]/)[0].replace(/[-\/]/g, ''))
            return (
                (searchType === ID && reg.test(item.idc)) ||
                (searchType === NAME && reg.test(item.user_name)) ||
                (searchType === DESCRIPTION && reg.test(item.content))
            ) && (
                numStartTime <= itemTime &&
                numEndTime >= itemTime
            )
        })
    } catch (e) {
        return e.message
    }
}

// 定时器检查内存使用，超过一定阈值后报警写日志，在报警状态下低于一定阈值后复位至正常状态
let memoryAlert = false
setInterval(() => getMemory().then(({usedMemPercentage}) => {
    if (memoryAlert) {
        if (usedMemPercentage <= 70) memoryAlert = false
    } else if (usedMemPercentage >= 85) {
        memoryAlert = true
        // 注意，由于日志解析代码过于耦合，除非你知道如何修改，否则不要随便乱动！
        fs.writeFileSync('log/access.log', `  [${new Date().toLocaleString()}]:"MemoryAlert HTTP\n`, {flag: 'a'})
    }
}), 1000)

module.exports = {
    getAllSystemLog2,
    searchByCondition,
    searchByAdvancedCondition,
    showSystemLog,
}
