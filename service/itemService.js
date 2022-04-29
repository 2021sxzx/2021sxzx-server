const modelRule = require('../model/rule')
const modelRegion = require('../model/region')
const modelTask = require('../model/task')
const modelRemoteCheckLog = require('../model/remoteCheckLog')
const request = require('request')
const schedule = require('node-schedule')

var regionDic = { status: 0, data: {} }
var ruleDic = { status: 0, data: {} }

var tasks = []
var running = false

async function initialize() {
    try {
        //初始化区划树
        regionDic.status = 0
        var regions = await modelRegion.find({}, { __v: 0 })
        for (let i = 0, len = regions.length; i < len; i++) {
            regionDic.data[regions[i]._id.toString()] = Object.assign({}, regions[i]._doc)
        }
        //区划树完成
        regionDic.status = 1
        console.log('Get Region Tree !!!')
        //初始化规则树
        ruleDic.status = 0
        var rules = await modelRule.find({ rule_name: { $ne: 'null' } }, { _id: 0, __v: 0 })
        for (let i = 0, len = rules.length; i < len; i++) {
            ruleDic.data[rules[i].rule_id] = Object.assign({}, rules[i]._doc)
        }
        //规则树完成
        ruleDic.status = 1
        console.log('Get Rule Tree !!!')
    } catch (err) {
        console.log(err.message)
        setTimeout(() => {
            initialize()
        }, 5000);
    }
}

initialize()

async function createRegions(region_id) {
    //把字典设为不可用状态
    regionDic.status = 0
    //以数据库中已创建的数据为准
    try {
        var result = await modelRegion.find({ _id: { $in: region_id } }, { __v: 0 })
        let id = []
        for (let i = 0; i < result.length; i++) {
            id.push(result[i].parentId)
        }
        var result1 = await modelRegion.find({ _id: { $in: id } }, { __v: 0 })
    } catch (err) {
        throw new Error(err.message)
    }
    //新增数据
    for (let i = 0; i < result.length; i++) {
        regionDic.data[result[i]._id.toString()] = Object.assign({}, result[i]._doc)
    }
    //更新对应父节点的children数组
    for (let i = 0; i < result1.length; i++) {
        regionDic.data[result1[i]._id.toString()].children = Array.prototype.concat.apply([], result1[i].children)
    }
    //把字典设为可用状态
    regionDic.status = 1
}

async function deleteRegions(region_id) {
    //把字典设为不可用状态
    regionDic.status = 0
    //删除数据
    for (let i = 0; i < region_id.length; i++) {
        let parent = regionDic.data[regionDic.data[region_id[i]].parentId]
        if (parent) {
            parent.children.splice(parent.children.indexOf(region_id[i]), 1)
        }
        delete regionDic.data[region_id[i]]
    }
    //把字典设为可用状态
    regionDic.status = 1
}

async function updateRegions(region_id) {
    //把字典设为不可用状态
    regionDic.status = 0
    //以数据库当前数据为准，仅更新单个数据
    var result = null
    try {
        result = await modelRegion.find({ _id: { $in: region_id } }, { __v: 0 })
    } catch (err) {
        throw new Error(err.message)
    }
    //更新数据
    for (let i = 0; i < result.length; i++) {
        //修改内存中的数据
        regionDic.data[result[i]._id.toString()].region_code = result[i].region_code
        regionDic.data[result[i]._id.toString()].region_name = result[i].region_name
        regionDic.data[result[i]._id.toString()].region_level = result[i].region_level
        regionDic.data[result[i]._id.toString()].creator_id = result[i].creator_id
        // regionDic.data[result[i]._id.toString()].children = Array.prototype.concat.apply([], result[i].children)
        //parentId有改变的话要修改父节点的children数组
        if (regionDic.data[result[i]._id.toString()].parentId !== result[i].parentId) {
            let old_parent = regionDic.data[regionDic.data[result[i]._id.toString()].parentId]
            if (old_parent) {
                old_parent.children.splice(old_parent.children.indexOf(result[i]._id.toString()), 1)
            }
            let new_parent = regionDic.data[result[i].parentId]
            if (new_parent) {
                new_parent.children.push(result[i]._id.toString())
            }
            regionDic.data[result[i]._id.toString()].parentId = result[i].parentId
        }
    }
    //把字典设为可用状态
    regionDic.status = 1
}

async function createRules(rule_id) {
    //把字典设为不可用状态
    ruleDic.status = 0
    //以数据库中已创建的数据为准
    var result = null
    var result1 = null
    try {
        result = await modelRule.find({ rule_id: { $in: rule_id } }, { __v: 0 })
        let id = []
        for (let i = 0; i < result.length; i++) {
            id.push(result[i].parentId)
        }
        result1 = await modelRule.find({ rule_id: { $in: id } }, { __v: 0 })
    } catch (err) {
        throw new Error(err.message)
    }
    //新增数据
    for (let i = 0; i < result.length; i++) {
        ruleDic.data[result[i].rule_id] = Object.assign({}, result[i]._doc)
    }
    //更新对应父节点的children数组
    for (let i = 0; i < result1.length; i++) {
        ruleDic.data[result1[i].rule_id].children = Array.prototype.concat([], result1[i].children)
    }
    //把字典设为可用状态
    ruleDic.status = 1
}

async function deleteRules(rule_id) {
    //把字典设为不可用状态
    ruleDic.status = 0
    //删除数据
    for (let i = 0; i < rule_id.length; i++) {
        let parent = ruleDic.data[ruleDic.data[rule_id[i]].parentId]
        if (parent) {
            parent.children.splice(parent.children.indexOf(rule_id[i]), 1)
        }
        delete ruleDic.data[rule_id[i]]
    }
    //把字典设为可用状态
    ruleDic.status = 1
}

async function updateRules(rule_id) {
    //把字典设为不可用状态
    ruleDic.status = 0
    //以数据库当前数据为准，仅更新单个数据
    try {
        var result = await modelRule.find({ rule_id: { $in: rule_id } }, { __v: 0 })
    } catch (err) {
        throw new Error(err.message)
    }
    //修改内存中的数据
    for (let i = 0; i < result.length; i++) {
        ruleDic.data[result[i].rule_id].rule_name = result[i].rule_name
        ruleDic.data[result[i].rule_id].creator_id = result[i].creator_id
        //parentId有改变的话要修改父节点的children数组
        if (ruleDic.data[result[i].rule_id].parentId !== result[i].parentId) {
            let old_parent = ruleDic.data[ruleDic.data[result[i].rule_id].parentId]
            if (old_parent) {
                old_parent.children.splice(old_parent.children.indexOf(result[i].rule_id), 1)
            }
            let new_parent = ruleDic.data[result[i].parentId]
            if (new_parent) {
                new_parent.children.push(result[i].rule_id)
            }
            ruleDic.data[result[i].rule_id].parentId = result[i].parentId
        }
    }
    //把字典设为可用状态
    ruleDic.status = 1
}

/**
 * 添加一个更新内存中数据的任务
 * @param {String} functionName 函数名
 * @param {Array<String>} data 要更新的id
 */
async function addUpdateTask(functionName, data) {
    switch (functionName) {
        case 'createRegions':
            tasks.push(createRegions(data))
            break
        case 'deleteRegions':
            tasks.push(deleteRegions(data))
            break
        case 'updateRegions':
            tasks.push(updateRegions(data))
            break
        case 'createRules':
            tasks.push(createRules(data))
            break
        case 'deleteRules':
            tasks.push(deleteRules(data))
            break
        case 'updateRules':
            tasks.push(updateRules(data))
            break
    }
    runTasks()
}

/**
 * 顺序执行tasks数组中的全部函数（同一时间只会有一个runTasks运行）
 * @returns 
 */
async function runTasks() {
    if (running === true) return
    running = true
    while (tasks.length > 0) {
        await tasks.shift()
    }
    running = false
}

/**
 * 获取内存中的区划树
 * @returns Object || null
 */
function getRegionDic() {
    if (regionDic.status === 1) {
        return regionDic.data
    } else {
        return null
    }
}

/**
 * 获取内存中的规则树
 * @returns Object || null
 */
function getRuleDic() {
    if (ruleDic.status === 1) {
        return ruleDic.data
    } else {
        return null
    }
}

const listItemBasicByOrg_Url = 'http://api2.gzonline.gov.cn:9090/api/eshore/two/power/listItemBasicByOrg'
const getItem_Url = 'http://api2.gzonline.gov.cn:9090/api/eshore/two/power/getItem'
const ANNOUNCED = '3'   //已公示的事项的状态码

/**
 * 发post请求
 * @param {String} url 地址
 * @param {Object} requestData 请求体
 * @returns 
 */
function postRequest(url, requestData) {
    return new Promise(function (resolve, reject) {
        request({
            url: url,
            method: 'POST',
            json: true,
            headers: {
                'content-type': 'application/json'
            },
            body: requestData
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body)
            } else {
                reject(response)
            }
        })
    })
}

/**
 * 发get请求
 * @param {String} url 地址
 * @returns 
 */
function getRequest(url) {
    return new Promise(function (resolve, reject) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body)
            } else {
                reject(response)
            }
        })
    })
}

/**
 * 根据组织机构代码获取服务机构的事项列表
 * @param {String} org_code 组织机构代码
 * @param {Number} page_size 分页大小（限制为10或20）
 * @param {Number} page_num 页码（从1开始）
 * @returns 
 */
function listItemBasicByOrg(org_code, page_size, page_num) {
    return new Promise(function (resolve, reject) {
        postRequest(listItemBasicByOrg_Url, {
            org_code: org_code,
            task_state: ANNOUNCED,
            page_size: page_size,
            page_num: page_num
        }).then(function (body) {
            resolve(body)
        }).catch(function (reason) {
            reject(reason)
        })
    })
}

/**
 * 根据事项编码/情形（办理项）编码获取事项/情形（办理项）详细信息
 * @param {String} code 事项编码
 * @returns 
 */
function getItemByCode(code) {
    return new Promise(function (resolve, reject) {
        postRequest(getItem_Url, {
            code: code
        }).then(function (body) {
            body = body.data
            if (body.is_announced !== ANNOUNCED) {
                resolve(null)
            } else {
                resolve(body)
            }
        }).catch(function (reason) {
            reject(reason)
        })
    })
}

/**
 * 根据事项编码/情形（办理项）编码获取事项/情形（办理项）详细信息
 * @param {String} situation_code 情形（办理项）编码
 * @returns 
 */
function getItemBySituationCode(situation_code) {
    return new Promise(function (resolve, reject) {
        postRequest(getItem_Url, {
            situation_code: situation_code
        }).then(function (body) {
            body = body.data
            if (body.is_announced !== ANNOUNCED) {
                resolve(null)
            } else {
                resolve(body)
            }
        }).catch(function (reason) {
            reject(reason)
        })
    })
}

/**
 * 根据事项的实施编码获取事项/情形（办理项）详细信息
 * @param {String} carry_out_code 实施编码
 * @returns 
 */
function getItem(carry_out_code) {
    return new Promise(function (resolve, reject) {
        getItemByCode(carry_out_code)
            .then(function (value) {
                var items = []
                //如果事项没有公示就返回空数组
                if (value === null) {
                    resolve(items)
                }
                //如果事项有若干个办理项，就返回办理项数组
                if (value.situation.length > 0) {
                    var promiseList = []
                    for (let i = 0, len = value.situation.length; i < len; i++) {
                        promiseList.push(getItemBySituationCode(value.situation[i].situation_code))
                    }
                    //并行请求结果
                    Promise.all(promiseList)
                        .then(function (situations) {
                            var result = []
                            for (let i = 0, len = situations.length; i < len; i++) {
                                if (situations[i] !== null) {
                                    result.push(situations[i])
                                }
                            }
                            resolve(result)
                        })
                        .catch(function (reason) {
                            reject(reason)
                        })
                }
                //如果事项没有办理项，就返回他自己
                items.push(value)
                resolve(items)
            })
            .catch(function (reason) {
                reject(reason)
            })
    })
}

/**
 * 根据组织机构代码获取全部事项信息
 * @param {String} org_code 组织机构代码
 * @returns 
 */
function getAllItemBasicByOrg(org_code) {
    return new Promise(function (resolve, reject) {
        const PAGE_SIZE = 20    //10或者20
        listItemBasicByOrg(org_code, PAGE_SIZE, 1)
            .then(function (body) {
                //通过第一次请求的结果计算一共有多少页
                var total = body.total
                var maxPageNum = Math.ceil(total / PAGE_SIZE)
                var promiseList = []
                for (let i = 1; i <= maxPageNum; i++) {
                    promiseList.push(listItemBasicByOrg(org_code, PAGE_SIZE, i))
                }
                //并行请求结果
                Promise.all(promiseList)
                    .then(function (value) {
                        var items = []
                        for (let i = 0, len = value.length; i < len; i++) {
                            Array.prototype.push.apply(items, value[i].data)
                        }
                        resolve(items)  //返回一个区划的全部事项
                    })
                    .catch(function (reason) {
                        reject(reason)
                    })
            })
            .catch(function (reason) {
                reject(reason)
            })
    })
}

/**
 * 根据组织机构代码获取全部事项/办理项的详细信息
 * @param {String} org_code 组织机构代码
 * @returns 
 */
function getAllItemsByOrg(org_code) {
    return new Promise(function (resolve, reject) {
        getAllItemBasicByOrg(org_code)
            .then(function (value) {
                var promiseList = []
                for (let i = 0, len = value.length; i < len; i++) {
                    promiseList.push(getItem(value[i].carry_out_code))
                }
                Promise.all(promiseList)
                    .then(function (items) {
                        var result = []
                        for (let i = 0, len = items.length; i < len; i++) {
                            Array.prototype.push.apply(result, items[i])
                        }
                        resolve(result)
                    })
                    .catch(function (reason) {
                        reject(reason)
                    })
            })
            .catch(function (reason) {
                reject(reason)
            })
    })
}

/**
 * 检查一个组织机构的全部事项
 * @param {String} org_code 组织机构代码
 */
async function checkOrganizationItems(org_code) {
    //从省政务获取该区划的全部事项
    try {
        var remoteItems = await getAllItemsByOrg(org_code)
    } catch (err) {
        throw new Error('-----\n获取省政务服务系统数据失败，错误信息：\n' + err.message + '\n-----')
    }
    //把事项的实施编码和办理项编码合成task_code
    var remoteItemCodes = []
    var dict = {}
    for (let i = 0, len = remoteItems.length; i < len; i++) {
        if (remoteItems[i].situation_code === '' || remoteItems[i].situation_code === null) {
            remoteItems[i].task_code = remoteItems[i].carry_out_code
            remoteItems[i].task_name = remoteItems[i].name
            remoteItemCodes.push(remoteItems[i].carry_out_code)
            dict[remoteItems[i].carry_out_code] = remoteItems[i]
        } else {
            remoteItems[i].task_code = remoteItems[i].situation_code
            remoteItems[i].task_name = remoteItems[i].situation_name
            remoteItemCodes.push(remoteItems[i].situation_code)
            dict[remoteItems[i].situation_code] = remoteItems[i]
        }
    }
    var inLocalNinRemote = []   //数据库有但是省政务没有
    var inRemoteNinLocal = []   //省政务有但是数据库没有
    var differences = []        //省政务和数据都有，但是内容不一样
    try {
        inLocalNinRemote = await modelTask.find({ task_code: { $nin: remoteItemCodes } }, { task_code: 1 })
        for (let i = 0, len = inLocalNinRemote.length; i < len; i++) {
            let task = inLocalNinRemote.shift()
            inLocalNinRemote.push(task.task_code)
        }
        for (let i = 0, len = remoteItemCodes.length; i < len; i++) {
            let task = await modelTask.findOne({ task_code: remoteItemCodes[i] })
            if (task === null) {
                inRemoteNinLocal.push(remoteItemCodes[i])
            } else {
                if (compareTwoObjects(task, dict[remoteItemCodes[i]]) === false) {
                    differences.push(remoteItemCodes[i])
                }
            }
        }
    } catch (err) {
        throw new Error('-----\n数据库操作失败，错误信息：\n' + err.message + '\n-----')
    }
    return {
        inLocalNinRemote: inLocalNinRemote,
        inRemoteNinLocal: inRemoteNinLocal,
        differences: differences
    }
}

/**
 * 比较数据库中的事项指南对象和省政务中对应的事项指南对象是否相同
 * @param {Object} object1 数据库中的事项指南对象
 * @param {Object} object2 省政务中的事项指南对象
 * @returns 
 */
function compareTwoObjects(object1, object2) {
    var keys1 = Object.keys(object1)
    var keys2 = Object.keys(object2)
    //遍历第一个对象的key
    for (let i = 0; i < keys1.length; i++) {
        //如果object1中的key在object2中没有，就跳过这个key
        if (keys2.includes(keys1[i]) === false) {
            continue
        }
        //如果这个key对应的value是Object，就递归
        if (object1[keys1[i]] instanceof Object) {
            if (object2[keys1[i]] instanceof Object) {
                compareTwoObjects(object1[keys1[i]], object2[keys1[i]])
            } else {
                return false
            }
        }
        //如果这个key对应的value是数组，就遍历
        if (object1[keys1[i]] instanceof Array) {
            for (let j = 0, len = object1[keys1[i]].length; j < len; j++) {
                //如果数组元素是对象
                if (object1[keys1[i]][j] instanceof Object) {
                    if (object2[keys1[i]][j] instanceof Object) {
                        compareTwoObjects(object1[keys1[i]][j], object2[keys1[i]][j])
                    } else {
                        return false
                    }
                }
                //如果数组元素不是对象就直接比较，不存在嵌套数组
                else {
                    if (object1[keys1[i]][j] !== object2[keys1[i]][j]) {
                        return false
                    }
                }
            }
        }
        //直接比较
        if (object1[keys1[i]] !== object2[keys1[i]]) {
            return false
        }
    }
    return true
}

var checkResult = {}    //检查结果，key是区划编码，value是对象
var recheckRegions = [] //检查过程中出错的区划，需要重新检查
var recheckTime = 3     //最大重新检查次数

/**
 * 检查全部区划的事项
 * @param {Array<String>} regions 需要检查的区划
 * @param {Number} time 函数第time次调用
 * @returns 
 */
async function checkAllRegionsItems(regions, time) {
    console.log('开始检查各区划的事项指南信息')
    //检查是否超过最大次数
    if (time > recheckTime) {
        return
    }
    //如果传入空数组就是检查全部区划，否则只检查regions数组内的区划
    if (regions.length <= 0) {
        try {
            regions = await modelRegion.find({}, { region_code: 1, region_name: 1, org_code: 1 })
        } catch (err) {
            throw new Error('获取区划信息失败，错误信息：\n' + err.message)
        }
    }
    //遍历regions数组
    for (let i = 0, len = regions.length; i < len; i++) {
        var region = regions.shift()
        try {
            var result = await checkOrganizationItems(region.org_code)
            checkResult[region.region_code] = result
        } catch (err) {
            console.log('检查' + region.region_name + '事项出错，错误信息：\n' + err.message)
            recheckRegions.push(region.region_code)
        }
    }
    //存到数据库中
    var bulkOps = []
    var regionCodes = Object.keys(checkResult)
    for (let i = 0, len = regionCodes; i < len; i++) {
        try {
            var log = await modelRemoteCheckLog.exists({ region_code: regionCodes[i] }, { _id: 0 })
            if (log === false) {
                //数据不存在就新建
                bulkOps.push({
                    insertOne: {
                        document: {
                            region_code: regionCodes[i],
                            inLocalNinRemote: inLocalNinRemote,
                            inRemoteNinLocal: inRemoteNinLocal,
                            differences: differences
                        }
                    }
                })
            } else {
                //数据存在就覆盖
                bulkOps.push({
                    updateOne: {
                        filter: { region_code: regionCodes[i] },
                        update: {
                            inLocalNinRemote: inLocalNinRemote,
                            inRemoteNinLocal: inRemoteNinLocal,
                            differences: differences
                        }
                    }
                })
            }
        } catch (err) {
            console.log('查询' + regionCodes[i] + '相关数据失败，错误信息：\n' + err.message)
        }
    }
    try {
        var bulkOpsResult = await modelRemoteCheckLog.bulkWrite(bulkOps)
    } catch (err) {
        console.log(bulkOpsResult)
        console.log('数据库操作失败，只更新了部分数据，错误信息：\n' + err.message)
    }
    //中途有出错的区划需要重新检查
    if (recheckRegions.length > 0) {
        checkAllRegionsItems(recheckRegions, time + 1)
    }
    console.log('检查完毕')
}

/**
 * 获取检查结果
 * @returns {Object} key是区划编码，value是{inLocalNinRemote,inRemoteNinLocal,differences}
 */
async function getCheckResult() {
    var keys = Object.keys(checkResult)
    if (keys.length > 0) {
        return checkResult
    }
    var logs = await modelRemoteCheckLog.find({})
    var result = {}
    for (let i = 0, len = logs.length; i < len; i++) {
        result[logs[i].region_code] = {
            inLocalNinRemote: logs[i].inLocalNinRemote,
            inRemoteNinLocal: logs[i].inRemoteNinLocal,
            differences: logs[i].differences
        }
    }
    return result
}

//初始状态是每周日4点
var rule = new schedule.RecurrenceRule()
rule.year = 2023    //这里设置为2023年只是因为暂时不要现在执行
rule.dayOfWeek = [0]
rule.hour = 4
rule.minute = 0

var checkJob = schedule.scheduleJob(rule, function () { checkAllRegionsItems([], 0) })
console.log('下一次检查时间：' + checkJob.nextInvocation())

/**
 * 设置定时任务执行时间
 * @param {Array<Number>} dayOfWeek Number数组，0表示周日，1-6表示周一到周六
 * @param {Number} hour 24小时制
 * @param {Number} minute 分钟
 */
function setCheckJobRule(dayOfWeek, hour, minute) {
    var result = checkJob.reschedule(new schedule.RecurrenceRule({
        dayOfWeek: dayOfWeek,
        hour: hour,
        minute: minute
    }))
    if (result === false) {
        throw new Error('设置失败')
    }
    rule.dayOfWeek = dayOfWeek
    rule.hour = hour
    rule.minute = minute
}

/**
 * 获取定时任务执行时间
 * @returns {Object} { dayOfWeek, hour, minute }
 */
function getCheckJobRule() {
    return {
        dayOfWeek: rule.dayOfWeek,
        hour: rule.hour,
        minute: rule.minute
    }
}

module.exports = {
    addUpdateTask,
    getRegionDic,
    getRuleDic,
    setCheckJobRule,
    getCheckJobRule,
    getCheckResult
}