const modelRule = require('../model/rule')
const modelRegion = require('../model/region')
const modelTask = require('../model/task')
const modelRemoteCheckLog = require('../model/remoteCheckLog')
const modelUsers = require('../model/users')
const request = require('request')
const schedule = require('node-schedule')

//---------------------------------------------------------------------------------
//以下为项目启动时初始化的代码

initialize()

async function initialize() {
    //初始化用户
    var result = false
    while (result === false) {
        result = await initializeUser()
    }
    console.log('已初始化管理员账号')
    //先初始化数据库
    result = false
    while (result === false) {
        result = await initializeRegion()
    }
    console.log('已初始化region表')
    result = false
    while (result === false) {
        result = await initializeRule()
    }
    console.log('已初始化rule表')
    //再初始化缓存数据
    result = false
    while (result === false) {
        result = await initializeMemory()
    }
    console.log('已初始化内存数据对象')
    //初始化定时器
    await initializeCheckJob()
    console.log('已初始化定时器')
}

//------------------------------------------------------------------------------------
//以下为本地缓存相关的代码

var regionDic = { status: 0, data: {} }
var ruleDic = { status: 0, data: {} }

var tasks = []
var running = false

async function initializeMemory() {
    try {
        //初始化区划树
        regionDic.status = 0
        var regions = await modelRegion.find({}, { __v: 0 })
        for (let i = 0, len = regions.length; i < len; i++) {
            regionDic.data[regions[i]._id.toString()] = Object.assign({}, regions[i]._doc)
        }
        //区划树完成
        regionDic.status = 1
        console.log('初始化区划规则成功')
        //初始化规则树
        ruleDic.status = 0
        var rules = await modelRule.find({ rule_name: { $ne: 'null' } }, { _id: 0, __v: 0 })
        for (let i = 0, len = rules.length; i < len; i++) {
            ruleDic.data[rules[i].rule_id] = Object.assign({}, rules[i]._doc)
        }
        //规则树完成
        ruleDic.status = 1
        console.log('初始化业务规则成功')
        return true
    } catch (err) {
        console.log('初始化缓存数据失败')
        console.log(err.message)
        return false
    }
}

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
    tasks.push({ functionName: functionName, data: data })
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
        var obj = tasks.shift()
        switch (obj.functionName) {
            case 'createRegions':
                await createRegions(obj.data)
                break
            case 'deleteRegions':
                await deleteRegions(obj.data)
                break
            case 'updateRegions':
                await updateRegions(obj.data)
                break
            case 'createRules':
                await createRules(obj.data)
                break
            case 'deleteRules':
                await deleteRules(obj.data)
                break
            case 'updateRules':
                await updateRules(obj.data)
                break
        }
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

//---------------------------------------------------------------------
//以下为检查事项指南详情的代码

const getToken_Url = 'http://api2.gzonline.gov.cn:9090/oauth/token'
const getChildRegionList_Url = 'http://api2.gzonline.gov.cn:9090/api/eshore/two/OrganizationService/getChildRegionList'
const getOrganListByRegionCode_Url = 'http://api2.gzonline.gov.cn:9090/api/eshore/two/OrganizationService/getOrganListByRegionCode'
const listItemBasicByOrg_Url = 'http://api2.gzonline.gov.cn:9090/api/eshore/two/power/listItemBasicByOrg'
const getItem_Url = 'http://api2.gzonline.gov.cn:9090/api/eshore/two/power/getItem'
const ANNOUNCED = '3'   //已公示的事项的状态码
const client_id = 'basicUser20190821144223063'
const client_secret = 'e9e413e43b8d43cd8e71243cdbec5cd6'
var token = ''
const TYPE = 'PARALLEL'   //SERIAL或者PARALLEL
const GZ_REGIONCODE = '440100000000'

/**
 * 获取token
 * @returns 
 */
function getToken() {
    return new Promise(function (resolve, reject) {
        var url = getToken_Url + '?client_id=' + client_id + '&client_secret=' + client_secret
        var option = {
            url: url,
            method: 'GET',
            json: true,
            timeout: 20000
        }
        request(option, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body.access_token)
            } else {
                reject(error)
            }
        })
    })
}

/**
 * 发post请求
 * @param {String} url 地址
 * @param {Object} requestData 请求体
 * @returns 
 */
function postRequest(url, requestData) {
    return new Promise(async function (resolve, reject) {
        if (token === '') {
            try {
                token = await getToken()
            } catch (err) {
                console.log('GET TOKEN ERROR')
                token = ''
                resolve('RETRY')
            }
        }
        var newUrl = url + '?access_token=' + token
        var option = {
            url: newUrl,
            method: 'POST',
            json: true,
            headers: { 'content-type': 'application/json' },
            form: requestData,
            timeout: 20000
        }
        request(option, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body)
            } else {
                if (!error) {
                    console.log('POST: ' + newUrl + ' 失败')
                    console.log('请求体: ' + JSON.stringify(requestData))
                    console.log(response)
                }
                else if (error.code !== 'ESOCKETTIMEDOUT') {
                    console.log('POST: ' + newUrl + ' 失败')
                    console.log('请求体: ' + JSON.stringify(requestData))
                    console.log(error)
                }
                token = ''
                resolve('RETRY')
            }
        })
    })
}

/**
 * 根据区划编码获取下级区划信息
 * @param {String} region_code 区划编码
 * @returns 
 */
async function getChildRegionList(region_code) {
    try {
        var body = {}
        var retry = 10
        do {
            body = await postRequest(getChildRegionList_Url, {
                region_code: region_code
            })
            retry -= 1
        } while (body === 'RETRY' && retry > 0)
        if (body === 'RETRY') {
            console.log('获取' + region_code + '的下级区划信息失败，重试了' + retry + '次')
            return null
        }
        return body
    } catch (error) {
        console.log('根据' + region_code + '获取下级区划信息失败')
        throw new Error(error.message)
    }
}

/**
 * 根据区划编码获取组织机构信息
 * @param {String} region_code 区划编码
 * @returns 
 */
async function getOrganListByRegionCode(region_code) {
    try {
        var body = {}
        var retry = 10
        do {
            body = await postRequest(getOrganListByRegionCode_Url, {
                region_code: region_code
            })
            retry -= 1
        } while (body === 'RETRY' && retry > 0)
        if (body === 'RETRY') {
            console.log('获取' + region_code + '的组织机构信息失败，重试了' + retry + '次')
            return null
        }
        return body
    } catch (error) {
        console.log('根据' + region_code + '获取组织机构信息失败')
        throw new Error(error.message)
    }
}

/**
 * 根据组织机构代码获取服务机构的事项列表
 * @param {String} org_code 组织机构代码
 * @param {Number} page_size 分页大小（限制为10或20）
 * @param {Number} page_num 页码（从1开始）
 * @returns 
 */
async function listItemBasicByOrg(org_code, page_size, page_num) {
    try {
        var body = {}
        var retry = 10
        do {
            body = await postRequest(listItemBasicByOrg_Url, {
                org_code: org_code,
                task_state: ANNOUNCED,
                page_size: page_size,
                page_num: page_num
            })
            retry -= 1
        } while (body === 'RETRY' && retry > 0)
        if (body === 'RETRY') {
            console.log('获取' + org_code + '第' + page_num + '页的事项列表失败，重试了' + retry + '次')
            return null
        }
        return body
    } catch (error) {
        console.log('根据' + org_code + '获取服务机构的事项列表失败')
        throw new Error(error.message)
    }
}

/**
 * 根据事项编码/情形（办理项）编码获取事项/情形（办理项）详细信息
 * @param {String} code 事项编码
 * @returns 
 */
async function getItemByCode(code) {
    try {
        var body = {}
        var retry = 10
        do {
            body = await postRequest(getItem_Url, {
                code: code
            })
            retry -= 1
        } while (body === 'RETRY' && retry > 0)
        if (body === 'RETRY') {
            console.log('获取' + code + '的事项详细信息失败，重试了' + retry + '次')
            return null
        }
        if (!body.data) {
            console.log('请求' + code + '事项详细信息有问题，返回的body如下：')
            console.log(body)
            return null
        }
        if (body.data.state !== ANNOUNCED || body.data.service_item_type === '9' || body.data.service_item_type === '13' || body.data.service_item_type === '14') {
            return null
        } else {
            return body.data
        }
    } catch (error) {
        console.log('根据' + code + '获取事项详细信息失败')
        console.log(body)
        throw new Error(error.message)
    }
}

/**
 * 根据事项编码/情形（办理项）编码获取事项/情形（办理项）详细信息
 * @param {String} situation_code 情形（办理项）编码
 * @returns 
 */
async function getItemBySituationCode(situation_code) {
    try {
        var body = {}
        var retry = 10
        do {
            body = await postRequest(getItem_Url, {
                situation_code: situation_code
            })
            retry -= 1
        } while (body === 'RETRY' && retry > 0)
        if (body === 'RETRY') {
            console.log('获取' + situation_code + '的办理项详细信息失败，重试了' + retry + '次')
            return null
        }
        if (!body.data) {
            console.log('请求' + situation_code + '情形（办理项）详细信息有问题，返回的body如下：')
            console.log(body)
            return null
        }
        if (body.data.state !== ANNOUNCED || body.data.service_item_type === '9' || body.data.service_item_type === '13' || body.data.service_item_type === '14') {
            return null
        } else {
            return body.data
        }
    } catch (error) {
        console.log('根据' + situation_code + '获取情形（办理项）详细信息失败')
        console.log(body)
        throw new Error(error.message)
    }
}

/**
 * 根据事项的实施编码获取事项/情形（办理项）详细信息
 * @param {String} carry_out_code 实施编码
 * @returns 
 */
async function getItem(carry_out_code) {
    try {
        var value = await getItemByCode(carry_out_code)
        //如果事项没有公示就返回空数组
        if (value === null) {
            return []
        }
        //如果事项有若干个办理项，就返回办理项数组
        if (value.situation.length > 0) {
            var situations = []
            //并行
            if (TYPE === 'PARALLEL') {
                var promiseList = []
                for (let i = 0, len = value.situation.length; i < len; i++) {
                    promiseList.push(getItemBySituationCode(value.situation[i].situation_code))
                }
                situations = await Promise.all(promiseList)
            }
            //------
            //串行
            else {
                for (let i = 0, len = value.situation.length; i < len; i++) {
                    let s = await getItemBySituationCode(value.situation[i].situation_code)
                    situations.push(s)
                }
            }
            //------
            var result = []
            for (let i = 0, len = situations.length; i < len; i++) {
                if (situations[i] !== null) {
                    result.push(situations[i])
                }
            }
            return result
        }
        //如果事项没有办理项，就返回他自己
        return [value]
    } catch (error) {
        console.log('根据' + carry_out_code + '获取事项/情形（办理项）详细信息失败')
        throw new Error(error.message)
    }
}

/**
 * 获取当前区划及其下级区划
 * @param {String} region_code 区划编码
 * @returns {Array<String>} 数组元素是区划编码
 */
async function getChildRegions(region_code) {
    try {
        var regions = []
        regions.push(region_code)
        var result = await getChildRegionList(region_code)
        console.log('已获取' + region_code + '的下级区划')
        var childRegions = result.data ? result.data : []
        for (let j = 0; j < childRegions.length; j++) {
            regions.push(childRegions[j].CODE)
        }
        return regions
    } catch (error) {
        console.log('获取' + region_code + '及其全部下级区划失败')
        throw new Error(error.message)
    }
}

/**
 * 获取当前区划及其全部下级区划
 * @param {String} region_code 区划编码
 * @returns {Array<String>} 数组元素是区划编码
 */
async function getAllChildRegions(region_code) {
    try {
        var regions = []
        regions.push(region_code)
        var arr = []
        arr.push(region_code)
        while (arr.length > 0) {
            var result = []
            //并行
            if (TYPE === 'PARALLEL') {
                console.log('获取' + arr + '的下级区划')
                var promiseList = []
                for (let i = 0, len = arr.length; i < len; i++) {
                    let region = arr.shift()
                    promiseList.push(getChildRegionList(region))
                }
                result = await Promise.all(promiseList)
                console.log('获取成功')
            }
            //------
            //串行
            else {
                for (let i = 0, len = arr.length; i < len; i++) {
                    let region = arr.shift()
                    let r = await getChildRegionList(region)
                    console.log('已获取' + region + '的下级区划')
                    result.push(r)
                }
            }
            //------
            for (let i = 0, len = result.length; i < len; i++) {
                var childRegions = result[i].data ? result[i].data : []
                for (let j = 0; j < childRegions.length; j++) {
                    regions.push(childRegions[j].CODE)
                    arr.push(childRegions[j].CODE)
                }
            }
        }
        return regions
    } catch (error) {
        console.log('获取' + region_code + '及其全部下级区划失败')
        throw new Error(error.message)
    }
}

/**
 * 获取全部区划的人社局组织机构代码
 * @param {Array<String>} regionCodes 区划数组
 * @returns {Array<Object>} [ { region_code: String, org_code: Array<String> } ]
 */
async function getOrganOfRegions(regionCodes) {
    try {
        var value = []
        //并行
        if (TYPE === 'PARALLEL') {
            var promiseList = []
            for (let i = 0, len = regionCodes.length; i < len; i++) {
                promiseList.push(getOrganListByRegionCode(regionCodes[i]))
            }
            value = await Promise.all(promiseList)
        }
        //------
        //串行
        else {
            for (let i = 0, len = regionCodes.length; i < len; i++) {
                let v = await getOrganListByRegionCode(regionCodes[i])
                console.log('已获取' + regionCodes[i] + '的组织机构代码')
                value.push(v)
            }
        }
        //------
        var result = []
        for (let i = 0, len = value.length; i < len; i++) {
            //在区划的全部组织机构中匹配人力资源和社会保障局
            var organs = value[i].data ? value[i].data : []
            for (let j = 0, len1 = organs.length; j < len1; j++) {
                //匹配到说明是市或者区
                if (organs[j].name.indexOf('人力资源和社会保障局') !== -1) {
                    var org = []
                    org.push(organs[j].org_code)
                    result.push({ region_code: regionCodes[i], org_code: org })
                    break
                }
                //遍历完匹配不到说明是街道或居委
                else if (j === len1 - 1) {
                    var org = []
                    organs.forEach(function (element) {
                        org.push(element.org_code)
                    })
                    result.push({ region_code: regionCodes[i], org_code: org })
                }
            }
            if (organs.length <= 0) {
                result.push({ region_code: regionCodes[i], org_code: [] })
            }
        }
        return result
    } catch (error) {
        console.log('获取全部区划的人社局组织机构代码失败')
        throw new Error(error.message)
    }
}

/**
 * 根据组织机构代码获取全部事项的基本信息
 * @param {String} org_code 组织机构代码
 * @returns 
 */
async function getAllItemBasicByOrg(org_code) {
    try {
        const PAGE_SIZE = 20
        var body = await listItemBasicByOrg(org_code, PAGE_SIZE, 1)
        if (body === null) {
            reject('获取' + org_code + '的全部事项基本信息失败')
        }
        //通过第一次请求的结果计算一共有多少页
        var total = body.total
        var maxPageNum = Math.ceil(total / PAGE_SIZE)
        console.log('org_code: ' + org_code + '\ttotal: ' + total + '\tmaxPageNum: ' + maxPageNum)
        var value = []
        //并行
        if (TYPE === 'PARALLEL') {
            var promiseList = []
            for (let i = 1; i <= maxPageNum; i++) {
                promiseList.push(listItemBasicByOrg(org_code, PAGE_SIZE, i))
            }
            value = await Promise.all(promiseList)
        }
        //------
        //串行
        else {
            for (let i = 1; i <= maxPageNum; i++) {
                let v = await listItemBasicByOrg(org_code, PAGE_SIZE, i)
                value.push(v)
            }
        }
        //------
        var items = []
        for (let i = 0, len = value.length; i < len; i++) {
            Array.prototype.push.apply(items, value[i].data ? value[i].data : [])
        }
        return items
    } catch (error) {
        console.log('根据' + org_code + '获取全部事项的基本信息失败')
        throw new Error(error.message)
    }
}

/**
 * 根据组织机构代码获取全部事项/办理项的详细信息
 * @param {String} org_code 组织机构代码
 * @returns 
 */
async function getAllItemsByOrg(org_code) {
    try {
        var value = await getAllItemBasicByOrg(org_code)
        var items = []
        //并行
        if (TYPE === 'PARALLEL') {
            var promiseList = []
            for (let i = 0, len = value.length; i < len; i++) {
                promiseList.push(getItem(value[i].carry_out_code))
            }
            items = await Promise.all(promiseList)
        }
        //------
        //串行
        else {
            for (let i = 0, len = value.length; i < len; i++) {
                let it = await getItem(value[i].carry_out_code)
                items.push(it)
            }
        }
        //------
        var result = []
        for (let i = 0, len = items.length; i < len; i++) {
            Array.prototype.push.apply(result, items[i])
        }
        console.log('org_code: ' + org_code + '\titems: ' + result.length)
        return result
    } catch (error) {
        console.log('根据' + org_code + '获取全部事项/办理项的详细信息失败')
        throw new Error(error.message)
    }
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
        throw new Error(err.message)
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
        console.log('检查失败')
        throw new Error(err.message)
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
    try {
        if (regions.length <= 0) {
            regions = await getAllChildRegions(GZ_REGIONCODE)
            //检查一下区划信息
            var inLocalNinRemote = []   //数据库有但是省政务没有
            var inRemoteNinLocal = []   //省政务有但是数据库没有
            try {
                inLocalNinRemote = await modelRegion.find({ region_code: { $nin: regions } }, { region_code: 1 })
                for (let i = 0, len = inLocalNinRemote.length; i < len; i++) {
                    let region = inLocalNinRemote.shift()
                    inLocalNinRemote.push(region.region_code)
                }
                for (let i = 0, len = regions.length; i < len; i++) {
                    let exist = await modelRegion.exists({ region_code: regions[i] })
                    if (exist === false) {
                        inRemoteNinLocal.push(regions[i])
                    }
                }
            } catch (err) {
                console.log('检查区划信息失败')
                throw new Error(err.message)
            }

        }
        var orgs = await getOrganOfRegions(regions)
    } catch (err) {
        throw new Error(err.message)
    }
    //遍历regions数组
    for (let i = 0, len = orgs.length; i < len; i++) {
        var region = orgs[i]
        try {
            var result = await checkOrganizationItems(region.org_code)
            checkResult[region.region_code] = result
        } catch (err) {
            console.log('检查' + region.region_name + '事项出错，错误信息：')
            console.log(err.message)
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
                            inLocalNinRemote: checkResult[regionCodes[i]].inLocalNinRemote,
                            inRemoteNinLocal: checkResult[regionCodes[i]].inRemoteNinLocal,
                            differences: checkResult[regionCodes[i]].differences
                        }
                    }
                })
            } else {
                //数据存在就覆盖
                bulkOps.push({
                    updateOne: {
                        filter: { region_code: regionCodes[i] },
                        update: {
                            inLocalNinRemote: checkResult[regionCodes[i]].inLocalNinRemote,
                            inRemoteNinLocal: checkResult[regionCodes[i]].inRemoteNinLocal,
                            differences: checkResult[regionCodes[i]].differences
                        }
                    }
                })
            }
        } catch (err) {
            console.log('查询' + regionCodes[i] + '相关数据失败，错误信息：')
            console.log(err.message)
        }
    }
    try {
        var bulkOpsResult = await modelRemoteCheckLog.bulkWrite(bulkOps)
    } catch (err) {
        // console.log(bulkOpsResult)
        console.log('数据库操作失败，只更新了部分数据，错误信息：')
        console.log(err.message)
    }
    //中途有出错的区划需要重新检查
    if (recheckRegions.length > 0) {
        checkAllRegionsItems(recheckRegions, time + 1)
    }
    console.log('检查完毕')
    console.log('下一次检查时间：' + checkJob.nextInvocation())
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

//--------------------------------------------------------------------------
//以下为初始化数据库的代码

async function initializeUser() {
    try {
        var user = await modelUsers.findOne({ account: 'admin' })
        if (user === null) {
            var result = await modelUsers.create({
                user_name: '管理员',
                role_id: 0,
                account: 'admin',
                password: 'password123'
            })
        }
        return true
    } catch (err) {
        console.log(err.message)
        return false
    }
}

/**
 * 初始化数据库的region表
 * @returns {boolean} 初始化成功or失败
 */
async function initializeRegion() {
    //数据库中region表是否为空
    try {
        var regionCount = await modelRegion.countDocuments({})
    } catch (err) {
        console.log(err.message)
        return false
    }
    //region表空的就初始化region数据
    if (!regionCount || regionCount <= 0) {
        var result = false
        while (result === false) {
            result = await initializeRegionSchema()
        }
    }
    return true
}

/**
 * 初始化数据库的rule表
 * @returns {boolean} 初始化成功or失败
 */
async function initializeRule() {
    //数据库中rule表是否为空
    try {
        var ruleCount = await modelRule.countDocuments({})
    } catch (err) {
        console.log(err.message)
        return false
    }
    //rule表空的就初始化rule数据
    if (!ruleCount || ruleCount <= 0) {
        var result = false
        while (result === false) {
            result = await initializeRuleSchema()
        }
    }
    return true
}

/**
 * 从省政务获取全部区划数据
 * @returns {Array<Object>} 区划数据
 */
async function getAllRegions() {
    try {
        var user = await modelUsers.findOne({ account: 'admin' })
        if (user === null) {
            await initializeUser()
            throw new Error('没有管理员账号')
        }
        var regions = []
        regions.push({
            region_code: GZ_REGIONCODE,
            region_name: '广州市',
            parent_code: '',
            creator_id: user._id
        })
        var arr = []
        arr.push(GZ_REGIONCODE)
        while (arr.length > 0) {
            var result = []
            //并行
            if (TYPE === 'PARALLEL') {
                console.log('获取' + arr + '的下级区划')
                var promiseList = []
                for (let i = 0, len = arr.length; i < len; i++) {
                    let region = arr.shift()
                    promiseList.push(getChildRegionList(region))
                }
                result = await Promise.all(promiseList)
                console.log('获取成功')
            }
            //------
            //串行
            else {
                for (let i = 0, len = arr.length; i < len; i++) {
                    let region = arr.shift()
                    let r = await getChildRegionList(region)
                    console.log('已获取' + region + '的下级区划')
                    result.push(r)
                }
            }
            //------
            for (let i = 0, len = result.length; i < len; i++) {
                var childRegions = result[i].data ? result[i].data : []
                for (let j = 0; j < childRegions.length; j++) {
                    regions.push({
                        region_code: childRegions[j].CODE,
                        region_name: childRegions[j].SHORT_CODE,
                        parent_code: childRegions[j].PARENT_CODE,
                        creator_id: user._id
                    })
                    arr.push(childRegions[j].CODE)
                }
            }
        }
        return regions
    } catch (error) {
        console.log('获取全部区划失败')
        throw new Error(error.message)
    }
}

/**
 * 初始化数据库中的区划表
 * @returns {boolean} 初始化成功or失败
 */
async function initializeRegionSchema() {
    try {
        //先清空region表，避免多次执行的时候出问题
        await modelRegion.deleteMany({})
        //获取全部区划数据
        var regions = await getAllRegions()
        //写入数据库
        var result = await modelRegion.create(regions)
        //用_id初始化parentId字段和children字段
        var tree = {}
        for (let i = 0, len = regions.length; i < len; i++) {
            tree[regions[i].region_code] = regions[i]
        }
        var regionTree = {}
        for (let i = 0, len = result.length; i < len; i++) {
            regionTree[result[i].region_code] = Object.assign({}, result[i])
        }
        var keys = Object.keys(regionTree)
        for (let i = 0, len = keys.length; i < len; i++) {
            let r = regionTree[keys[i]]
            let parent_code = tree[r.region_code].parent_code
            r.parentId = (parent_code === '') ? '' : regionTree[parent_code]._id
            if (parent_code !== '') {
                let parent = regionTree[parent_code]
                parent.children.push(r._id)
            }
        }
        //更新数据库
        var bulkOps = []
        for (let i = 0, len = keys.length; i < len; i++) {
            bulkOps.push({
                updateOne: {
                    filter: { _id: regionTree[keys[i]]._id },
                    update: regionTree[keys[i]]
                }
            })
        }
        await modelRegion.bulkWrite(bulkOps)
        return true
    } catch (err) {
        console.log('初始化region表失败')
        console.log(err.message)
        return false
    }
}

/**
 * 初始化数据库中的rule表
 * @returns {boolean} 初始化成功or失败
 */
async function initializeRuleSchema() {
    try {
        //先清空rule表，避免多次执行的时候出问题
        await modelRule.deleteMany({})
        var user = await modelUsers.findOne({ account: 'admin' })
        if (user === null) {
            await initializeUser()
            throw new Error('没有管理员用户')
        }
        var rules = [
            {
                rule_id: '0',
                rule_name: '人社局业务规则',
                parentId: '',
                children: ['1', '2', '3', '4'],
                creator_id: user._id
            },
            {
                rule_id: '1',
                rule_name: '人才人事',
                parentId: '0',
                creator_id: user._id
            },
            {
                rule_id: '2',
                rule_name: '就业创业',
                parentId: '0',
                creator_id: user._id
            },
            {
                rule_id: '3',
                rule_name: '社会保险',
                parentId: '0',
                creator_id: user._id
            },
            {
                rule_id: '4',
                rule_name: '劳动保障',
                parentId: '0',
                creator_id: user._id
            }
        ]
        //写入数据库
        var result = await modelRule.create(rules)
        return true
    } catch (err) {
        console.log('初始化rule表失败')
        console.log(err.message)
        return false
    }
}

//--------------------------------------------------------------------------
//以下为定时器的代码

var checkJob = null
var rule = null

async function initializeCheckJob() {
    if (checkJob !== null) {
        return
    }
    //初始状态是每周日4点
    rule = new schedule.RecurrenceRule()
    rule.dayOfWeek = [0]
    rule.hour = 4
    rule.minute = 0
    checkJob = schedule.scheduleJob(rule, function () { checkAllRegionsItems([], 0) })
    // console.log(checkJob.nextInvocation())
}

/**
 * 设置定时任务执行时间
 * @param {Array<Number>} dayOfWeek Number数组，0表示周日，1-6表示周一到周六
 * @param {Number} hour 24小时制
 * @param {Number} minute 分钟
 */
function setCheckJobRule(dayOfWeek, hour, minute) {
    var newRule = new schedule.RecurrenceRule()
    newRule.dayOfWeek = dayOfWeek
    newRule.hour = hour
    newRule.minute = minute
    if (checkJob === null) {
        checkJob = schedule.scheduleJob(newRule, function () { checkAllRegionsItems([], 0) })
        rule = newRule
        return
    }
    var result = checkJob.reschedule(newRule)
    if (result === false) {
        throw new Error('设置失败')
    }
    rule = newRule
}

/**
 * 获取定时任务执行时间
 * @returns {Object} { dayOfWeek, hour, minute }
 */
function getCheckJobRule() {
    if (rule === null) {
        return {}
    }
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