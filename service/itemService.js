const modelRule = require('../model/rule')
const modelRegion = require('../model/region')

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
        regionDic.data[result[i]._id.toString()] = Object.assign({}, result[i]._doc)
    }
    //更新对应父节点的children数组
    for (let i = 0; i < result1.length; i++) {
        regionDic.data[result1[i]._id.toString()].children = Array.prototype.concat([], result1[i].children)
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
        regionDic.data[result[i]._id].region_code = result[i].region_code
        regionDic.data[result[i]._id].region_name = result[i].region_name
        regionDic.data[result[i]._id].region_level = result[i].region_level
        //parentId有改变的话要修改父节点的children数组
        if (regionDic.data[result[i]._id].parentId !== result[i].parentId) {
            let old_parent = regionDic.data[regionDic.data[result[i]._id].parentId]
            if (old_parent) {
                old_parent.children.splice(old_parent.children.indexOf(result[i]._id), 1)
            }
            let new_parent = regionDic.data[result[i].parentId]
            if (new_parent) {
                new_parent.children.push(result[i]._id)
            }
            regionDic.data[result[i]._id].parentId = result[i].parentId
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
    var result = null
    try {
        result = await modelRule.find({ rule_id: { $in: rule_id } }, { __v: 0 })
    } catch (err) {
        throw new Error(err.message)
    }
    //修改内存中的数据
    for (let i = 0; i < result.length; i++) {
        ruleDic.data[result[i].rule_id].rule_name = result[i].rule_name
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



module.exports = {
    addUpdateTask,
    getRegionDic,
    getRuleDic
}