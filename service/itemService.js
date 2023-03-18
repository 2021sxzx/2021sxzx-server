const modelRule = require('../model/rule')
const modelRegion = require('../model/region')
const modelTask = require('../model/task')
const modelRemoteCheckLog = require('../model/remoteCheckLog')
const request = require('request')
const schedule = require('node-schedule')
const mongoose = require("mongoose");
//---------------------------------------------------------------------------------
//以下为初始化所需的全局变量
/**
 * 区划树的缓存对象。当 status === 0 表示该对象处于空闲状态。但 status === 1 表示该对象正在被写入，此时禁止读取。
 * @type {{data: {}, status: number}}
 */
const regionDic = {status: 0, data: {}}
/**
 * 规则树的缓存对象。当 status === 0 表示该对象处于空闲状态。但 status === 1 表示该对象正在被写入，此时禁止读取。
 * @type {{data: Map<string,{}>, status: number}}
 */
const ruleDic = {
    status: 0, // 0 表示未上锁，可读写。1 表示上锁，不可读写。
    data: new Map() // key：rule_id, value: rule
}

//------------------------------------------------------------------------------------
//以下为本地缓存相关的代码
// 执行栈
const tasks = []
// 函数 runTasks 是否正在运行，用于保证该函数最多只有一个在同时运行
let running = false

function initializeMemory() {
    try {
        // 异步初始化区划树
        ;(async () => { // 这个分号用于防止歧义，不能删除。
            regionDic.status = 0
            const regions = await modelRegion.find({}, {__v: 0});
            for (let i = 0, len = regions.length; i < len; i++) {
                regionDic.data[regions[i]._id.toString()] = Object.assign({}, regions[i]._doc)
            }
            //区划树完成
            regionDic.status = 1
            console.log('区划树缓存对象初始化成功')
        })()

        // 异步初始化规则树
        ;(async () => { // 这个分号用于防止歧义，不能删除。
            // 上锁
            ruleDic.status = 0

            const rules = await modelRule.find({rule_name: {$ne: 'null'}}, {_id: 0, __v: 0})

            for (let i = 0; i < rules.length; i++) {
                ruleDic.data.set(rules[i].rule_id, rules[i]._doc)
            }

            //规则树完成，解锁
            ruleDic.status = 1
            console.log('规则树缓存对象初始化成功')
        })()

    } catch (err) {
        console.log('缓存对象初始化失败')
        console.log(err.message)
    }
}

async function createRegions(region_id) {
    //把字典设为不可用状态
    regionDic.status = 0
    let result, result1
    //以数据库中已创建的数据为准
    try {
        result = await modelRegion.find({_id: {$in: region_id}}, {__v: 0})
        let id = []
        for (let i = 0; i < result.length; i++) {
            id.push(result[i].parentId)
        }
        result1 = await modelRegion.find({_id: {$in: id}}, {__v: 0})
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
        result = await modelRegion.find({_id: {$in: region_id}}, {__v: 0})
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

async function createRules(ruleIdArray) {
    //把字典设为不可用状态
    ruleDic.status = 0
    //以数据库中已创建的数据为准
    let newRules // 新添加的规则
    let parentRules // 新添加的规则的父规则

    try {
        // 找出所有新添加的规则
        newRules = await modelRule.find({rule_id: {$in: ruleIdArray}}, {__v: 0})

        const id = newRules.map(rule => {
            return rule.parentId
        })

        // 找出所有新添加的规则的父规则
        parentRules = await modelRule.find({rule_id: {$in: id}}, {__v: 0})
    } catch (err) {
        throw new Error(err.message)
    }

    //新增数据
    for (let i = 0; i < newRules.length; i++) {
        ruleDic.data.set(newRules[i].rule_id, newRules[i]._doc)
    }

    //更新对应父节点的children数组
    for (let i = 0; i < parentRules.length; i++) {
        if(ruleDic.data.has(parentRules[i].rule_id)){
            ruleDic.data.get(parentRules[i].rule_id).children = parentRules[i].children
        }
    }

    //把字典设为可用状态
    ruleDic.status = 1
}

async function deleteRules(ruleIdArray) {
    //把字典设为不可用状态
    ruleDic.status = 0

    // 在规则树中删除对应规则
    for (let i = 0; i < ruleIdArray.length; i++) {
        ruleDic.data.delete(ruleIdArray[i])
    }

    // 在父规则的孩子中删除对应规则
    for (let i = 0; i < ruleIdArray.length; i++) {
        if (ruleDic.data.has(ruleIdArray[i].parentId)) {
            const parent = ruleDic.data.get(ruleIdArray[i].parentId)
            parent.children.splice(parent.children.indexOf(ruleIdArray[i]), 1)
        }
    }

    //把字典设为可用状态
    ruleDic.status = 1
}

async function updateRules(ruleIdArray) {
    //把字典设为不可用状态
    ruleDic.status = 0

    //以数据库当前数据为准，仅更新单个数据
    let updateRules
    try {
        updateRules = await modelRule.find({rule_id: {$in: ruleIdArray}}, {__v: 0})
    } catch (err) {
        throw new Error(err.message)
    }

    //修改内存中的数据
    for (let i = 0; i < updateRules.length; i++) {
        const rule = ruleDic.data.get(updateRules[i].rule_id)
        rule.rule_name= updateRules[i].rule_name
        rule.creator_id = updateRules[i].creator_id

        //parentId 有改变的话，还要额外更新新旧父节点的 children 数组
        if (rule.parentId !== updateRules[i].parentId) {
            const oldParent = ruleDic.data.get(rule.parentId)
            if (oldParent) {
                oldParent.children.splice(oldParent.children.indexOf(updateRules[i].rule_id), 1)
            }

            const newParent = ruleDic.data.get(updateRules[i].parentId)
            if (newParent) {
                newParent.children.push(updateRules[i].rule_id)
            }

           rule.parentId = updateRules[i].parentId
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
    tasks.push({functionName: functionName, data: data})
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
        const obj = tasks.shift();
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
 * @returns Map<string,{}> || null
 */
function getRuleDic(must = false) {
    if (ruleDic.status === 1 || must == true) {
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
let token = ''
const TYPE = "PARALLEL";   //SERIAL或者PARALLEL
const GZ_REGIONCODE = '440100000000'

/**
 * 获取token
 * @returns
 */
function getToken() {
    return new Promise(function (resolve, reject) {
        const url = getToken_Url + '?client_id=' + client_id + '&client_secret=' + client_secret
        console.log("getToken")
        const option = {
            url: url,
            method: 'GET',
            json: true,
            timeout: 20000
        }
        request(option, function (error, response, body) {
            if (!error && response.statusCode === 200) {
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
    return new Promise(async function (resolve) {
        if (token === '') {
            try {
                token = await getToken()
            } catch (err) {
                console.log('GET TOKEN ERROR')
                token = ''
                resolve('RETRY')
            }
        }
        const newUrl = url + '?access_token=' + token;
        const option = {
            url: newUrl,
            method: 'POST',
            json: true,
            headers: {'content-type': 'application/json'},
            form: requestData,
            timeout: 20000
        }
        request(option, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                resolve(body)
            } else {
                if (!error) {
                    console.log('POST: ' + newUrl + ' 失败')
                    console.log('请求体: ' + JSON.stringify(requestData))
                    console.log(response)
                } else if (error.code !== 'ESOCKETTIMEDOUT') {
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
        let body = {}
        let retry = 10
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
        let body = {}
        let retry = 10
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
        let body = {}
        let retry = 10
        //console.logorg_code))
        if(org_code[0] === "007485864")
            org_code[0] = "00749949X"
        
        do {
            body = await postRequest(listItemBasicByOrg_Url, {
                org_code: org_code[0],
                task_state: ANNOUNCED,
                page_size: page_size,
                page_num: page_num
            })
            retry -= 1
        } while (body === 'RETRY' && retry > 0)
        console.log(body.total)
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
    let body = {}
    let retry = 10
    try {
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
        throw new Error(error.message)
    }
}

/**
 * 根据事项编码/情形（办理项）编码获取事项/情形（办理项）详细信息
 * @param {String} situation_code 情形（办理项）编码
 * @returns
 */
async function getItemBySituationCode(situation_code) {
    let body = {}
    let retry = 10
    try {
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
        const value = await getItemByCode(carry_out_code)
        //如果事项没有公示就返回空数组
        if (value === null) {
            return []
        }
        //如果事项有若干个办理项，就返回办理项数组
        if (value.situation.length > 0) {
            let situations = []
            //并行
            if (TYPE === 'PARALLEL') {
                const promiseList = []
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
            const result = []
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
// async function getChildRegions(region_code) {
//     try {
//         var regions = []
//         regions.push(region_code)
//         var result = await getChildRegionList(region_code)
//         console.log('已获取' + region_code + '的下级区划')
//         var childRegions = result.data ? result.data : []
//         for (let j = 0; j < childRegions.length; j++) {
//             regions.push(childRegions[j].CODE)
//         }
//         return regions
//     } catch (error) {
//         console.log('获取' + region_code + '及其全部下级区划失败')
//         throw new Error(error.message)
//     }
// }

/**
 * 获取当前区划及其全部下级区划
 * @param {String} region_code 区划编码
 * @returns {Array<String>} 数组元素是区划编码
 */
async function getAllChildRegions(region_code) {
    try {
        // 存放所有区划及其下级区划的区划编码
        const regions = [region_code]
        // 需要去获取子区划的区划的区划编码列表
        const arr = [region_code]

        // 遍历 arr，检查这些区划是否有下级区划，如果有下级区划，就将下级区划 push 到 arr 和 regions，并将该区划从 arr 中移出
        while (arr.length > 0) {
            // 记录了 arr 中各个区划关于其下级区划的详细信息
            let result = []

            // 由于如果存在下级区划会 push 到 arr 后面，导致长度会改变，所以需要记录当前 arr 的长度，来记录所有需要检查的该级区划
            const len = arr.length

            //并行
            if (true) {
                // console.log('获取' + arr + '的下级区划')
                const promiseList = []
                console.log('正在获取下级区划...')
                for (let i = 0; i < len; i++) {
                    let region = arr.shift()
                    promiseList.push(getChildRegionList(region))
                }

                result = await Promise.all(promiseList)
                console.log(`获取下级区划成功`)
            } else { //串行
                for (let i = 0; i < len; i++) {
                    let region = arr.shift()

                    let r = await getChildRegionList(region)
                    console.log('已获取' + region + '的下级区划')
                    result.push(r)
                }
            }

            // 遍历获取的各个区划的下级区划信息
            for (let regionInfo of result) {
                const childRegions = regionInfo.data ? regionInfo.data : []
                // 将新获取的下级区划的编码添加到 arr 中
                for (let childRegion of childRegions) {
                    regions.push(childRegion.CODE)
                    arr.push(childRegion.CODE)
                }
            }
        }

        console.log('获取所有区划信息成功，regions = ', regions)
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
        let value = []

        if (true) { //并行
            const promiseList = []
            for (let i = 0, len = regionCodes.length; i < len; i++) {
                promiseList.push(getOrganListByRegionCode(regionCodes[i]))
            }
            value = await Promise.all(promiseList)
            console.log('getOrganListByRegionCode 成功')
        } else { //串行
            for (let i = 0, len = regionCodes.length; i < len; i++) {
                let v = await getOrganListByRegionCode(regionCodes[i])
                console.log('已获取' + regionCodes[i] + '的组织机构代码')
                value.push(v)
            }
        }

        const result = []
        for (let i = 0, len = value.length; i < len; i++) {
            //在区划的全部组织机构中匹配人力资源和社会保障局
            const organs = value[i].data ? value[i].data : []
            for (let j = 0, len1 = organs.length; j < len1; j++) {
                let org = []
                //匹配到说明是市或者区
                if (organs[j].name.indexOf('人力资源和社会保障局') !== -1) {
                    org.push(organs[j].org_code)
                    result.push({region_code: regionCodes[i], org_code: org})
                    break
                } else if (j === len1 - 1) { //遍历完匹配不到说明是街道或居委
                    organs.forEach(function (element) {
                        org.push(element.org_code)
                    })
                    result.push({region_code: regionCodes[i], org_code: org})
                }
            }
            if (organs.length <= 0) {
                result.push({region_code: regionCodes[i], org_code: []})
            }
        }
        return result
    } catch (error) {
        console.log('获取全部区划的人社局组织机构代码失败')
        return {
            msg: "获取全部区划的人社局组织机构代码失",
            data: error.message,
            code: 400
        };
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
        const body = await listItemBasicByOrg(org_code, PAGE_SIZE, 1)
        // console.log('body', body)
        if (body === null) {
            // TODO: 缺乏错误处理
            console.log('获取' + org_code + '的全部事项基本信息失败')
        }
        //通过第一次请求的结果计算一共有多少页
        const total = body.total
        const maxPageNum = Math.ceil(total / PAGE_SIZE)
        // console.log('org_code: ' + org_code + '\ttotal: ' + total + '\tmaxPageNum: ' + maxPageNum)

        // 获取分页后每一页的事项，{obj[][]}, 第一个下标代表第几页，第二个下标表示该页中第几个事项
        let pages = []

        //并行
        if (TYPE === 'PARALLEL') {
            const promiseList = []
            for (let i = 1; i <= maxPageNum; i++) {
                promiseList.push(listItemBasicByOrg(org_code, PAGE_SIZE, i))
            }
            pages = await Promise.all(promiseList)
        } else { //串行
            for (let i = 1; i <= maxPageNum; i++) {
                let page = await listItemBasicByOrg(org_code, PAGE_SIZE, i)
                pages.push(page)
            }
        }
        //------
        // 将每一个分页拼起来，形成一个完整的事项的基本信息列表
        const items = []
        for (let i in pages) {
            // 如果该页有事项，就把事项的基本信息放进列表
            if (pages[i].data) {
                items.push(...pages[i].data)
            }
            // items.push(pages[i].data ? pages[i].data : [])
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
        // 获取事项的基础信息列表
        const basicItems = await getAllItemBasicByOrg(org_code)
        console.log('getAllItemBasicByOrg 成功',)
        // 事项详细信息列表（包括空事项 [] 和没有拆分的办理项 [subItem1, subItem2, ...] 以及事项 [item]
        let items = []

        // 根据事项编码获取事项的详细信息
        if (TYPE === 'PARALLEL') { //并行
            const promiseList = []
            for (let basicItem of basicItems) {
                promiseList.push(getItem(basicItem.carry_out_code))
            }
            items = await Promise.all(promiseList)
        } else { //串行
            console.log("串行", org_code)
            for (let i = 0; i < basicItems.length; i++) {
                items.push(await getItem(basicItems[i].carry_out_code))
            }
        }

        // 过滤掉空事项和将办理项拆分后的所有有效事项列表
        const result = []

        items.forEach(item => {
            if (item.length > 0) {
                result.push(...item)
            }
        })

        console.log('获取组织编码为 ' + org_code + ' 的所有有效事项指南成功')
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
    let remoteItems
    //从省政务获取该区划的全部事项
    try {
        remoteItems = await getAllItemsByOrg(org_code)
    } catch (err) {
        throw new Error(err.message)
    }
    //把事项的实施编码和办理项编码合成task_code
    const remoteItemCodes = []
    const dict = {}
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
    let inLocalNinRemote = []   //数据库有但是省政务没有
    const inRemoteNinLocal = []   //省政务有但是数据库没有
    const differences = []        //省政务和数据都有，但是内容不一样
    try {
        inLocalNinRemote = await modelTask.find({task_code: {$nin: remoteItemCodes}}, {task_code: 1})
        for (let i = 0, len = inLocalNinRemote.length; i < len; i++) {
            let task = inLocalNinRemote.shift()
            inLocalNinRemote.push(task.task_code)
        }
        for (let i = 0, len = remoteItemCodes.length; i < len; i++) {
            let task = await modelTask.findOne({task_code: remoteItemCodes[i]})
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

const checkResult = {}    //检查结果，key是区划编码，value是对象

/**
 * 检查全部区划的事项
 * @param {Array<String>} regions 需要检查的区划
 * @param {Number} time 函数第time次调用
 * @returns
 */
async function checkAllRegionsItems(regions, time) {
    const recheckRegions = []; //检查过程中出错的区划，需要重新检查
    const recheckTime = 3; //最大重新检查次数

    console.log("开始检查各区划的事项指南信息");

    //检查是否超过最大次数
    if (time > recheckTime) {
        return;
    }
    //如果传入空数组就是检查全部区划，否则只检查regions数组内的区划

    if (regions.length <= 0) {
        regions = await getAllChildRegions(GZ_REGIONCODE);
        // console.log("获得的regions:",regions)
        //检查一下区划信息
        // var inLocalNinRemote = []   //数据库有但是省政务没有
        // var inRemoteNinLocal = []   //省政务有但是数据库没有
        // try {
        //     inLocalNinRemote = await modelRegion.find({ region_code: { $nin: regions } }, { region_code: 1 })
        //     for (let i = 0, len = inLocalNinRemote.length; i < len; i++) {
        //         let region = inLocalNinRemote.shift()
        //         inLocalNinRemote.push(region.region_code)
        //     }
        //     for (let i = 0, len = regions.length; i < len; i++) {
        //         let exist = await modelRegion.exists({ region_code: regions[i] })
        //         if (exist === false) {
        //             inRemoteNinLocal.push(regions[i])
        //         }
        //     }
        // } catch (err) {
        //     console.log('检查区划信息失败')
        //     throw new Error(err.message)
        // }
    }

    // await 了
    const orgs = await getOrganOfRegions(regions)
    // 荔湾区，越秀区，海珠区，白云区，天河区
    // 黄浦区，花都区，南沙区，从化区，增城区
    // 番禺区
    const orgs_need_list = [
        "007493506",
        "007496491",
        "00749949X",
        "007502521",
        "00750851X",
        "558372292",
        "007514442",
        "783785421",
        "007517547",
        "007520260",
        "552366115",
        "007485864",
    ];
    console.log("const orgs = await 已经获取全部事项");

    //遍历regions数组
    for (let i = 0, len = orgs.length; i < len; i++) {
        console.log(i, "+", len)
        const region = orgs[i];
        console.log(region.region_code)


        const childList = await getChildRegionList(region.region_code);
        if(childList == null) {
            console.log("居委会暂不处理")
            continue
        }
        
        try {
            checkResult[region.region_code] = await checkOrganizationItems(
                region.org_code
            );
        } catch (err) {
            console.log("检查" + region.region_name + "事项出错，错误信息：");
            console.log(err.message);
            recheckRegions.push(region.region_code);
        }
        // break
    }

    //存到数据库中
    const bulkOps = [];
    const regionCodes = Object.keys(checkResult);
    for (let i = 0, len = regionCodes.length; i < len; i++) {
        //console.log(regionCodes[i])
        //console.log(checkResult[regionCodes[i]])
        try {
            const log = await modelRemoteCheckLog.exists({
                region_code: regionCodes[i],
            });
            if (log === false) {
                //数据不存在就新建
                bulkOps.push({
                    insertOne: {
                        document: {
                            region_code: regionCodes[i],
                            inLocalNinRemote:
                                checkResult[regionCodes[i]].inLocalNinRemote,
                            inRemoteNinLocal:
                                checkResult[regionCodes[i]].inRemoteNinLocal,
                            differences:
                                checkResult[regionCodes[i]].differences,
                        },
                    },
                });
            } else {
                //数据存在就覆盖
                bulkOps.push({
                    updateOne: {
                        filter: { region_code: regionCodes[i] },
                        update: {
                            inLocalNinRemote:
                                checkResult[regionCodes[i]].inLocalNinRemote,
                            inRemoteNinLocal:
                                checkResult[regionCodes[i]].inRemoteNinLocal,
                            differences:
                                checkResult[regionCodes[i]].differences,
                        },
                    },
                });
            }
        } catch (err) {
            console.log("查询" + regionCodes[i] + "相关数据失败，错误信息：");
            console.log(err.message);
        }
    }
    try {
        await modelRemoteCheckLog.bulkWrite(bulkOps);
    } catch (err) {
        console.log("数据库操作失败，只更新了部分数据，错误信息：");
        console.log(err.message);
    }

    //中途有出错的区划需要重新检查
    if (recheckRegions.length > 0) {
        await checkAllRegionsItems(recheckRegions, time + 1);
    }

    console.log("检查完毕");
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
    // 该语句用于向MongoDB的数组插入数据
    // var insert = await modelRemoteCheckLog.update({$addToSet:{inLocalNinRemote:"11440115783785421N4442111015019"}})
    // var checkallregions = await checkAllRegionsItems([],0)
    var logs = await modelRemoteCheckLog.find({}, { inRemoteNinLocal: 1 });
    // for(let item of logs[0].inLocalNinRemote)
    // {
    //         let res = await modelItem.find({task_code:item})
    //         if(res.length==0)
    //             temp.push("已删除")
    //         else
    //             temp.push(res[0]["item_name"])
    // }
    var result = {}
    for (let i = 0, len = logs.length; i < len; i++) {
        result[logs[i].region_code] = {
            // inLocalNinRemote: logs[i].inLocalNinRemote,
            // inRemoteNinLocal: logs[i].inRemoteNinLocal,
            // differences: logs[i].differences,
            // handle_inLocalNinRemote: logs[i].handle_inLocalNinRemote,
            // handle_inRemoteNinLocal: logs[i].handle_inRemoteNinLocal,
            // handle_differences: logs[i].handle_differences,
            // inLocalNinRemoteGuideNames: logs[i].inLocalNinRemoteGuideNames,
            // differencesGuideNames: logs[i].differencesGuideNames

            inLocalNinRemote: [],
            inRemoteNinLocal: logs[i].inRemoteNinLocal,
            differences: [],
            handle_inLocalNinRemote: [],
            handle_inRemoteNinLocal: [],
            handle_differences: [],
            inLocalNinRemoteGuideNames: [],
            differencesGuideNames: [],
        };
    }
    return result
}

// TODO(钟卓江): 这里是不是用的假数据？这个函数未完成吗
async function updateCheckResult(arr) {
    return modelRemoteCheckLog.updateOne({"region_code": "440100000000"},
        {
            "inRemoteNinLocal": arr[0].guides,
            "handle_inRemoteNinLocal": arr[0].handle,
            "inRemoteNinLocalGuideNames": arr[0].item_name,
            "inLocalNinRemote": arr[1].guides,
            "handle_inLocalNinRemote": arr[1].handle,
            "inLocalNinRemoteGuideNames": arr[1].item_name,
            "differences": arr[2].guides,
            "handle_differences": arr[2].handle,
            "differencesGuideNames": arr[2].item_name
        });
}

//--------------------------------------------------------------------------
//以下为初始化数据库的代码

// async function initializeUser() {
//     try {
//         const user = await modelUsers.findOne({account: 'admin'})
//         if (user === null) {
//             var result = await modelUsers.create({
//                 user_name: '管理员',
//                 role_id: 0,
//                 account: 'admin',
//                 password: 'password123'
//             })
//         }
//         return true
//     } catch (err) {
//         console.log(err.message)
//         return false
//     }
// }

/**
 * 初始化数据库的region表
 * @returns {boolean} 初始化成功or失败
 */
// async function initializeRegion() {
//     //数据库中region表是否为空
//     try {
//         var regionCount = await modelRegion.countDocuments({})
//     } catch (err) {
//         console.log(err.message)
//         return false
//     }
//     //region表空的就初始化region数据
//     if (!regionCount || regionCount <= 0) {
//         var result = false
//         while (result === false) {
//             result = await initializeRegionSchema()
//         }
//     }
//     return true
// }

/**
 * 初始化数据库的rule表
 * @returns {boolean} 初始化成功or失败
 */
// async function initializeRule() {
//     //数据库中rule表是否为空
//     try {
//         var ruleCount = await modelRule.countDocuments({})
//     } catch (err) {
//         console.log(err.message)
//         return false
//     }
//     //rule表空的就初始化rule数据
//     if (!ruleCount || ruleCount <= 0) {
//         var result = false
//         while (result === false) {
//             result = await initializeRuleSchema()
//         }
//     }
//     return true
// }

/**
 * 从省政务获取全部区划数据
 * @returns {Array<Object>} 区划数据
 */
// async function getAllRegions() {
//     try {
//         var user = await modelUsers.findOne({account: 'admin'})
//         if (user === null) {
//             await initializeUser()
//             throw new Error('没有管理员账号')
//         }
//         var regions = []
//         regions.push({
//             region_code: GZ_REGIONCODE,
//             region_name: '广州市',
//             parent_code: '',
//             creator_id: user._id
//         })
//         var arr = []
//         arr.push(GZ_REGIONCODE)
//         while (arr.length > 0) {
//             var result = []
//             //并行
//             if (TYPE === 'PARALLEL') {
//                 console.log('获取' + arr + '的下级区划')
//                 var promiseList = []
//                 for (let i = 0, len = arr.length; i < len; i++) {
//                     let region = arr.shift()
//                     promiseList.push(getChildRegionList(region))
//                 }
//                 result = await Promise.all(promiseList)
//                 console.log('获取成功')
//             }
//                 //------
//             //串行
//             else {
//                 for (let i = 0, len = arr.length; i < len; i++) {
//                     let region = arr.shift()
//                     let r = await getChildRegionList(region)
//                     console.log('已获取' + region + '的下级区划')
//                     result.push(r)
//                 }
//             }
//             //------
//             for (let i = 0, len = result.length; i < len; i++) {
//                 var childRegions = result[i].data ? result[i].data : []
//                 for (let j = 0; j < childRegions.length; j++) {
//                     regions.push({
//                         region_code: childRegions[j].CODE,
//                         region_name: childRegions[j].SHORT_CODE,
//                         parent_code: childRegions[j].PARENT_CODE,
//                         creator_id: user._id
//                     })
//                     arr.push(childRegions[j].CODE)
//                 }
//             }
//         }
//         return regions
//     } catch (error) {
//         console.log('获取全部区划失败')
//         throw new Error(error.message)
//     }
// }

/**
 * 初始化数据库中的区划表
 * @returns {boolean} 初始化成功or失败
 */
// async function initializeRegionSchema() {
//     try {
//         //先清空region表，避免多次执行的时候出问题
//         await modelRegion.deleteMany({})
//         //获取全部区划数据
//         var regions = await getAllRegions()
//         //写入数据库
//         var result = await modelRegion.create(regions)
//         //用_id初始化parentId字段和children字段
//         var tree = {}
//         for (let i = 0, len = regions.length; i < len; i++) {
//             tree[regions[i].region_code] = regions[i]
//         }
//         var regionTree = {}
//         for (let i = 0, len = result.length; i < len; i++) {
//             regionTree[result[i].region_code] = Object.assign({}, result[i])
//         }
//         var keys = Object.keys(regionTree)
//         for (let i = 0, len = keys.length; i < len; i++) {
//             let r = regionTree[keys[i]]
//             let parent_code = tree[r.region_code].parent_code
//             r.parentId = (parent_code === '') ? '' : regionTree[parent_code]._id
//             if (parent_code !== '') {
//                 let parent = regionTree[parent_code]
//                 parent.children.push(r._id)
//             }
//         }
//         //更新数据库
//         var bulkOps = []
//         for (let i = 0, len = keys.length; i < len; i++) {
//             bulkOps.push({
//                 updateOne: {
//                     filter: {_id: regionTree[keys[i]]._id},
//                     update: regionTree[keys[i]]
//                 }
//             })
//         }
//         await modelRegion.bulkWrite(bulkOps)
//         return true
//     } catch (err) {
//         console.log('初始化region表失败')
//         console.log(err.message)
//         return false
//     }
// }

/**
 * 初始化数据库中的rule表
 * @returns {boolean} 初始化成功or失败
 */
// async function initializeRuleSchema() {
//     try {
//         //先清空rule表，避免多次执行的时候出问题
//         await modelRule.deleteMany({})
//         var user = await modelUsers.findOne({account: 'admin'})
//         if (user === null) {
//             await initializeUser()
//             throw new Error('没有管理员用户')
//         }
//         var rules = [
//             {
//                 rule_id: '0',
//                 rule_name: '人社局业务规则',
//                 parentId: '',
//                 children: ['1', '2', '3', '4'],
//                 creator_id: user._id
//             },
//             {
//                 rule_id: '1',
//                 rule_name: '人才人事',
//                 parentId: '0',
//                 creator_id: user._id
//             },
//             {
//                 rule_id: '2',
//                 rule_name: '就业创业',
//                 parentId: '0',
//                 creator_id: user._id
//             },
//             {
//                 rule_id: '3',
//                 rule_name: '社会保险',
//                 parentId: '0',
//                 creator_id: user._id
//             },
//             {
//                 rule_id: '4',
//                 rule_name: '劳动保障',
//                 parentId: '0',
//                 creator_id: user._id
//             }
//         ]
//         //写入数据库
//         var result = await modelRule.create(rules)
//         return true
//     } catch (err) {
//         console.log('初始化rule表失败')
//         console.log(err.message)
//         return false
//     }
// }

// 初始化 task 事项指南表（会清空数据库task表！！请勿在非初始化阶段使用！）
async function initializeTaskSchema() {
    console.log('开始初始化 task 表')

    //先清空 task 表，避免多次执行的时候出问题
    try {
        await modelTask.deleteMany({})
        console.log('清空 task 表')
    } catch (e) {
        console.log('清空 task 表失败', e)
    }

    // 获取所有区划
    let regions
    try {
        regions = await getAllChildRegions(GZ_REGIONCODE)
        console.log("获取所有区划成功")
    } catch (e) {
        console.log('获取所有区划失败', e)
    }

    let organs
    // 获取区划下所有组织
    try {
        console.log('正在获取所有组织代码...')
        organs = await getOrganOfRegions(regions)
        console.log('获取所有组织代码成功')
    } catch (e) {
        console.log('获取所有组织代码失败', e)
    }


    // 获取所有组织下的事项指南
    let remoteItems // 省政务的事项指南
    for (let i in organs) {
        const organ = organs[i]
        //从省政务获取该区划的全部事项
        try {
            remoteItems = await getAllItemsByOrg(organ.org_code[0])
            console.log(`从省政务获取该区划 ${organ} 的全部事项成功`)
        } catch (err) {
            console.log('从省政务获取事项失败')
            throw new Error(err.message)
        }

        // 对事项进行预处理
        for (let remoteItem of remoteItems) {
            // TODO(zzj) 对于这个 creator 要进行特殊处理，其创建的事项所有人可读写
            // 将创建人设置为开发人员账号，账号 account， creator_id = '62386b2b1e90ec7f7e958138'
            remoteItem.creator_id = '62386b2b1e90ec7f7e958138'

            // 初始化一些属性
            if (!remoteItem.submit_documents) {
                remoteItem.submit_documents = []
            }

            // 把事项的实施编码和办理项编码合成 task_code
            if (remoteItem.situation_code === '' || remoteItem.situation_code === null) {
                remoteItem.task_code = remoteItem.carry_out_code
                remoteItem.task_name = remoteItem.name
            } else {
                remoteItem.task_code = remoteItem.situation_code
                remoteItem.task_name = remoteItem.situation_name
            }
        }

        // console.log('处理后的 remoteItems', remoteItems)

        // 保存获取到的所有事项指南，写入到数据库
        try {
            await modelTask.create(remoteItems)
            console.log('成功写入 task 表')
        } catch (e) {
            console.log('写入 task 表失败', e)
        }
    }

    console.log('task 表初始化完成')
}

//--------------------------------------------------------------------------
//以下为定时器的代码
// 定期检查区划事项的定时器对象
let checkJob = null
// 记录了定时器下一次触发的时间
let rule = null

function initializeCheckJob() {
    // 如果已经设置定时器了就不初始化定时器了
    if (checkJob !== null) {
        return
    }
    //初始状态是每周日4点
    setCheckJobRule([4], 16, 30)
}

/**
 * 设置定时任务执行时间
 * @param {Array<Number>} dayOfWeek Number数组，0表示周日，1-6表示周一到周六
 * @param {Number} hour 24小时制
 * @param {Number} minute 分钟
 */
function setCheckJobRule(dayOfWeek, hour, minute) {
    // 初始化要设置的定时器触发时间
    const newRule = new schedule.RecurrenceRule()
    newRule.dayOfWeek = dayOfWeek
    newRule.hour = hour
    newRule.minute = minute
    // 更新 rule
    rule = newRule

    // 如果没有设置定时器就设置，如果设置了就重置定时器时间
    if (checkJob === null) {
        checkJob = schedule.scheduleJob(newRule, function () {
            checkAllRegionsItems([], 0).then(() => {
                console.log('下一次检查时间：' + checkJob.nextInvocation())
            }).catch((err) => {
                console.log('检查区划事项失败')
                console.log(err)
            })
        })

    } else {
        if (checkJob.reschedule(newRule) === false) {
            throw new Error('设置失败')
        }
    }
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

//---------------------------------------------------------------------------------
//以下为项目启动时的代码



// 初始化缓存对象
initializeMemory()

//初始化定时器
// initializeCheckJob()
// 初始化 task 表
// initializeTaskSchema()
// getChildRegionList("440100000000");


mongoose
    .connect("mongodb://root2:Hgc16711@8.134.73.52:27017/sxzx", {
        ssl: true,
        sslValidate: false,
        sslCA: "./config/mongodbSSL/ca.pem",
        sslKey: "./config/mongodbSSL/client.key",
        sslCert: "./config/mongodbSSL/client.crt",
    })
    .then(() => {
        console.log("MongoDB 连接成功");
    })
    .catch((err) => {
        console.log("MongoDB 连接失败。错误信息如下：");
        console.dir(err);
    });


function setCheckJobRule() {
    checkAllRegionsItems([], 0).then(() => {
                console.log('下一次检查时间：' + checkJob.nextInvocation())
            }).catch((err) => {
                console.log('检查区划事项失败')
                console.log(err)
            })
}

setCheckJobRule()

module.exports = {
    addUpdateTask,
    getRegionDic,
    getRuleDic,
    setCheckJobRule,
    getCheckJobRule,
    getCheckResult,
    updateCheckResult
}
