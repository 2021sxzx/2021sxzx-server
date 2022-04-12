const modelRule = require('../model/rule')
const modelRegion = require('../model/region')

var regionCodeDic = { status: 0, data: {} }
var regionIdDic = { status: 0, data: {} }
var ruleDic = { status: 0, data: {} }

var tasks = []
var running = false

async function initialize() {
    try {
        //初始化区划树
        regionCodeDic.status = 0
        regionIdDic.status = 0
        var regions = await modelRegion.find({}, { __v: 0 })
        for (let i = 0, len = regions.length; i < len; i++) {
            regionCodeDic.data[regions[i].region_code] = Object.assign({}, regions[i])
            regionIdDic.data[regions[i]._id] = Object.assign({}, regions[i])
            regionCodeDic.data[regions[i].region_code].children = []
        }
        //初始化区划树节点的children数组
        var keys = Object.keys(regionCodeDic.data)
        for (let i = 0, len = keys.length; i < len; i++) {
            var region = regionCodeDic.data[keys[i]]
            var parent = regionIdDic.data[region.parentId].region_code
            if (parent) {
                regionCodeDic.data[parent.region_code].children.push(keys[i])
            }
        }
        //区划树完成
        regionCodeDic.status = 1
        regionIdDic.status = 1
        console.log('Get Region Tree !!!')
        //初始化规则树
        ruleDic.status = 0
        var rules = await modelRule.find({ rule_name: { $ne: 'null' } }, { _id: 0, __v: 0 })
        for (let i = 0, len = rules.length; i < len; i++) {
            ruleDic.data[rules[i].rule_id] = Object.assign({}, rules[i])
            ruleDic.data[rules[i].rule_id].children = []
        }
        //初始化规则树节点的children数组
        var ruleKeys = Object.keys(ruleDic.data)
        for (let i = 0, len = ruleKeys.length; i < len; i++) {
            var rule = ruleDic.data[ruleKeys[i]]
            var parent = ruleDic.data[rule.parentId]
            if (parent) {
                parent.children.push(ruleKeys[i])
            }
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
    regionIdDic.status = 0
    regionCodeDic.status = 0
    //以数据库中已创建的数据为准
    var result = null
    var result1 = null
    try {
        result = await modelRegion.find({ _id: { $in: region_id } }, { __v: 0 })
        let id = []
        for (let i = 0; i < result.length; i++) {
            id.push(result[i].parentId)
        }
        result1 = await modelRegion.find({ _id: { $in: id } }, { __v: 0 })
    } catch (err) {
        throw new Error(err.message)
    }
    //新增数据
    for (let i = 0; i < result.length; i++) {
        regionIdDic.data[result[i]._id] = Object.assign({}, result[i])
        regionCodeDic.data[result[i].region_code] = Object.assign({}, result[i])
    }
    //更新对应父节点的children数组
    for (let i = 0; i < result1.length; i++) {
        regionIdDic.data[result1[i]._id].children = Array.prototype.concat([], result1[i].children)
    }
    //把字典设为可用状态
    regionIdDic.status = 1
    regionCodeDic.status = 1
}

async function deleteRegions(region_id) {
    //把字典设为不可用状态
    regionIdDic.status = 0
    regionCodeDic.status = 0
    //删除数据
    for (let i = 0; i < region_id.length; i++) {
        let region_code = regionIdDic.data[region_id[i]].region_code
        delete regionIdDic.data[region_id[i]]
        delete regionCodeDic.data[region_code]
    }
    //把字典设为可用状态
    regionIdDic.status = 1
    regionCodeDic.status = 1
}

async function updateRegions(region_id) {
    //把字典设为不可用状态
    regionIdDic.status = 0
    regionCodeDic.status = 0
    //以数据库当前数据为准，仅更新单个数据
    var result = null
    try {
        result = await modelRegion.find({ _id: { $in: region_id } }, { __v: 0 })
    } catch (err) {
        throw new Error(err.message)
    }
    //更新数据
    for (let i = 0; i < result.length; i++) {
        //对region_code改变的情况做特殊处理
        if (regionIdDic.data[result[i]._id].region_code != result[i].region_code) {
            let old_key = regionIdDic.data[result[i]._id].region_code
            let new_key = result[i].region_code
            regionCodeDic.data[new_key] = regionCodeDic.data[old_key]
            regionCodeDic.data[new_key].region_code = new_key
            delete regionCodeDic.data[old_key]
        }
        //修改内存中的数据
        regionIdDic.data[result[i]._id].region_code = result[i].region_code
        regionIdDic.data[result[i]._id].region_name = result[i].region_name
        regionIdDic.data[result[i]._id].region_level = result[i].region_level
        regionIdDic.data[result[i]._id].parentId = result[i].parentId
        regionCodeDic.data[result[i].region_code].region_code = result[i].region_code
        regionCodeDic.data[result[i].region_code].region_name = result[i].region_name
        regionCodeDic.data[result[i].region_code].region_level = result[i].region_level
        regionCodeDic.data[result[i].region_code].parentId = result[i].parentId
    }
    //把字典设为可用状态
    regionIdDic.status = 1
    regionCodeDic.status = 1
}

async function createRules(rule_id) {
    //把字典设为不可用状态
    ruleDic.status = 0
    //以数据库中已创建的数据为准
    var result = null
    try {
        result = await modelRule.find({ rule_id: { $in: rule_id } }, { __v: 0 })
    } catch (err) {
        throw new Error(err.message)
    }
    //新增数据
    for (let i = 0; i < result.length; i++) {
        ruleDic.data[result[i].rule_id] = Object.assign({}, result[i])
    }
    //把字典设为可用状态
    ruleDic.status = 1
}

async function deleteRules(rule_id) {
    //把字典设为不可用状态
    ruleDic.status = 0
    //删除数据
    for (let i = 0; i < rule_id.length; i++) {
        delete ruleDic.data[rule_id[i]]
    }
    //把字典设为可用状态
    ruleDic.status = 1
}

async function updateRules(rule_id) {
    //把字典设为不可用状态
    ruleDic.status = 0
    //以数据库当前数据为准，仅更新单个数据
    var result = null
    try {
        result = await modelRule.find({ rule_id: { $in: rule_id } }, { __v: 0 })
    } catch (err) {
        throw new Error(err.message)
    }
    //修改内存中的数据
    for (let i = 0; i < result.length; i++) {
        ruleDic.data[result[i].rule_id].rule_name = result[i].rule_name
        ruleDic.data[result[i].rule_id].parentId = result[i].parentId
    }
    //把字典设为可用状态
    ruleDic.status = 1
}

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

async function runTasks() {
    if (running === true) return
    running = true
    while (tasks.length > 0) {
        let func = tasks.shift()
        await func()
    }
    running = false
}

function getRegionCodeDic() {
    if (regionCodeDic.status === 1) {
        return regionCodeDic.data
    } else {
        return null
    }
}

function getRegionIdDic() {
    if (regionIdDic.status === 1) {
        return regionIdDic.data
    } else {
        return null
    }
}

function getRuleDic() {
    if (ruleDic.status === 1) {
        return ruleDic.data
    } else {
        return null
    }
}

module.exports = {
    addUpdateTask,
    getRegionCodeDic,
    getRegionIdDic,
    getRuleDic
}