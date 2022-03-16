const rule = require('../model/rule')
const item = require('../model/item')
const itemRule = require('../model/itemRule')
const task = require('../model/task')
const region = require('../model/region')

/**
 * 获取规则树
 * @returns 
 */
async function getRuleTree() {
    try {
        var rules = await rule.find().ne('rule_name', 'null')
        var res = {}
        for (let i = 0; i < rules.length; i++) {
            res[rules[i].rule_id] = {
                rule_id: rules[i].rule_id,
                rule_name: rules[i].rule_name,
                parentId: rules[i].parentId
            }
        }
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * 获取区划树
 * @returns 
 */
async function getRegionTree() {
    try {
        var regions = await region.find()
        var res = {}
        for (let i = 0; i < regions.length; i++) {
            res[regions[i].region_id] = {
                region_id: regions[i].region_id,
                region_name: regions[i].region_name,
                region_level: regions[i].region_level,
                parentId: regions[i].parentId
            }
        }
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * 获取满足指定条件的事项
 * @param {String} item_id
 * @param {String} release_time
 * @param {Number} item_status
 * @param {String} create_time
 * @param {String} task_code
 * @param {String} item_rule_id
 * @returns 
 */
async function getItems({
    item_id = null,
    release_time = null,
    item_status = null,
    create_time = null,
    task_code = null,
    item_rule_id = null
}) {
    try {
        var query = {}
        if (item_id !== null) {
            query.item_id = item_id
        }
        if (release_time !== null) {
            query.release_time = release_time
        }
        if (item_status !== null) {
            query.item_status = item_status
        }
        if (create_time !== null) {
            query.create_time = create_time
        }
        if (task_code !== null) {
            query.task_code = task_code
        }
        if (item_rule_id !== null) {
            query.item_rule_id = item_rule_id
        }
        var items = await item.find(query)
        var res = []
        for (let i = 0; i < items.length; i++) {
            res.push({
                item_id: items[i].item_id,
                release_time: items[i].release_time,
                item_status: items[i].item_status,
                create_time: items[i].create_time,
                task_code: items[i].task_code,
                item_rule_id: items[i].item_rule_id
            })
        }
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * 通过事项的item_id获取事项指南详情
 * @param {String} item_id 
 * @returns 
 */
async function getItemTask({ item_id = null }) {
    try {
        if (item_id === null) {
            throw new Error('call getItemTask error: item_id is null')
        }
        var res = await task.find({ item_id: item_id })
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * 通过事项指南的task_code或者task_name获取事项指南详情
 * @param {String} task_code
 * @param {String} task_name
 * @returns 
 */
async function getTasks({ task_code = null, task_name = null }) {
    try {
        var query = {}
        if (task_code !== null) {
            query.task_code = task_code
        }
        if (task_name !== null) {
            query.task_name = task_name
        }
        var res = await task.find(query)
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * 获取事项规则
 * @param {String} create_time
 * @param {String} item_rule_id
 * @param {String} rule_id
 * @param {String} region_id
 * @returns 
 */
async function getItemRule({
    create_time = null,
    item_rule_id = null,
    rule_id = null,
    region_id = null,
    return_stake = null
}) {
    try {
        if (return_stake === null) {
            throw new Error('call getItemRule error: return_stake is null')
        }
        var query = {}
        if (create_time !== null) {
            query.create_time = create_time
        }
        if (item_rule_id !== null) {
            query.item_rule_id = item_rule_id
        }
        if (rule_id !== null) {
            query.rule_id = rule_id
        }
        if (region_id !== null) {
            query.region_id = region_id
        }
        var itemrules = await itemRule.find(query)
        var res = []
        for (let i = 0; i < itemrules.length; i++) {
            if (return_stake === false && itemrules[i].rule_id === 'null' && itemrules[i].region_id === 'null') {
                continue
            }
            res.push({
                create_time: itemrules[i].create_time,
                item_rule_id: itemrules[i].item_rule_id,
                rule_id: itemrules[i].rule_id,
                region_id: itemrules[i].region_id
            })
        }
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * 获取规则
 * @param {String} rule_id
 * @param {String} rule_name
 * @param {String} parentId
 * @returns 
 */
async function getRule({
    rule_id = null,
    rule_name = null,
    parentId = null,
    return_stake = null
}) {
    try {
        if (return_stake === null) {
            throw new Error('call getRule error: return_stake is null')
        }
        var query = {}
        if (rule_id !== null) {
            query.rule_id = rule_id
        }
        if (rule_name !== null) {
            query.rule_name = rule_name
        }
        if (parentId !== null) {
            query.parentId = parentId
        }
        var rules = await rule.find(query)
        var res = []
        for (let i = 0; i < rules.length; i++) {
            if (return_stake === false && rules[i].rule_name === 'null') {
                continue
            }
            res.push({
                rule_id: rules[i].rule_id,
                rule_name: rules[i].rule_name,
                parentId: rules[i].parentId
            })
        }
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * 创建事项规则
 * @param {*} param0 
 * @returns 
 */
async function createItemRule({
    create_time = Date.now(),
    item_rule_id = null,
    rule_id = '',
    region_id = ''
}) {
    try {
        if (item_rule_id === null) {
            throw new Error('call createItemRule error: item_rule_id is null')
        }
        var res = await itemRule.create({
            create_time: create_time,
            item_rule_id: item_rule_id,
            rule_id: rule_id,
            region_id: region_id
        })
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * 创建规则
 * @param {*} param0 
 * @returns 
 */
async function createRule({
    rule_id = null,
    rule_name = null,
    parentId = null
}) {
    try {
        if (rule_id === null || rule_name === null || parentId === null) {
            throw new Error('call createRule error: some params are null')
        }
        var res = await rule.create({
            rule_id: rule_id,
            rule_name: rule_name,
            parentId: parentId
        })
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * 更新事项规则
 * @param {String} create_time 
 * @param {String} item_rule_id 
 * @param {String} rule_id 
 * @param {String} region_id
 * @returns 
 */
async function updateItemRule({
    create_time = null,
    item_rule_id = null,
    rule_id = null,
    region_id = null
}) {
    try {
        if (item_rule_id === null) {
            throw new Error('call updateItemRule error: item_rule_id is null')
        }
        var newData = {}
        if (create_time !== null) {
            newData.create_time = create_time
        }
        if (rule_id !== null) {
            newData.rule_id = rule_id
        }
        if (region_id !== null) {
            newData.region_id = region_id
        }
        var res = await itemRule.updateOne({ item_rule_id: item_rule_id }, newData)
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * 更新规则
 * @param {String} rule_id
 * @param {String} rule_name
 * @param {String} parentId
 * @returns 
 */
async function updateRule({
    rule_id = null,
    rule_name = null,
    parentId = null
}) {
    try {
        if (rule_id === null) {
            throw new Error('call updateRule error: rule_id is null')
        }
        var newData = {}
        if (rule_name !== null) {
            newData.rule_name = rule_name
        }
        if (parentId !== null) {
            newData.parentId = parentId
        }
        var res = await rule.updateOne({ rule_id: rule_id }, newData)
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

async function deleteRule({ rule_id = null }) {
    try {
        if (rule_id === null) {
            throw new Error('call deleteRule error: rule_id is null')
        }
        var res = await rule.deleteOne({ rule_id: rule_id })
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

async function deleteItemRule({ item_rule_id = null }) {
    try {
        if (item_rule_id === null) {
            throw new Error('call item_rule_id error: item_rule_id is null')
        }
        var res = await itemRule.deleteOne({ item_rule_id: item_rule_id })
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

async function getRulePath({ rule_id = null }) {
    try {
        if (rule_id === null) {
            throw new Error('call getRulePath error: rule_id is null')
        }
        var res = []
        var rs = await getRule({ return_stake: false })
        var rules = {}
        rs.forEach(function (item, index) {
            rules[item.rule_id] = item
        })
        do {
            let r = rules[rule_id]
            if (r) {
                res.unshift({
                    rule_id: r.rule_id,
                    rule_name: r.rule_name,
                    parentId: r.parentId
                })
            } else {
                throw new Error('规则id不存在: ' + rule_id)
            }
            rule_id = r.parentId
        } while (rule_id && rule_id !== '0')
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

async function getRegionPath({ region_id = null }) {
    try {
        if (region_id === null) {
            throw new Error('call getRegionPath error: region_id is null')
        }
        var res = []
        var rs = await getRegion({})
        var regions = {}
        rs.forEach(function (item, index) {
            regions[item.region_id] = item
        })
        do {
            let r = regions[region_id]
            if (r) {
                res.unshift({
                    region_id: r.region_id,
                    region_name: r.region_name,
                    region_level: r.region_level,
                    parentId: r.parentId
                })
            } else {
                throw new Error('区划id不存在: ' + region_id)
            }
            region_id = r.parentId
        } while (region_id && region_id !== '')
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

async function getRegion({
    region_id = null,
    region_name = null,
    region_level = null,
    parentId = null
}) {
    try {
        var query = {}
        if (region_id !== null) {
            query.region_id = region_id
        }
        if (region_name !== null) {
            query.region_name = region_name
        }
        if (region_level !== null) {
            query.region_level = region_level
        }
        if (parentId !== null) {
            query.parentId = parentId
        }
        var regions = await region.find(query)
        var res = []
        for (let i = 0; i < regions.length; i++) {
            res.push({
                region_id: regions[i].region_id,
                region_name: regions[i].region_name,
                region_level: regions[i].region_level,
                parentId: regions[i].parentId
            })
        }
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

async function getTask({ task_code = null }) {
    try {
        if (task_code === null) {
            throw new Error('call getTask error: task_code is null')
        }
        var res = await task.findOne({ task_code: task_code })
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

async function updateItem({
    item_id = null,
    release_time = null,
    item_status = null,
    create_time = null,
    task_code = null,
    item_rule_id = null
}) {
    try {
        if (item_id === null) {
            throw new Error('call updateItem error: item_id is null')
        }
        var newData = {}
        if (release_time !== null) {
            newData.release_time = release_time
        }
        if (item_status !== null) {
            newData.item_status = item_status
        }
        if (create_time !== null) {
            newData.create_time = create_time
        }
        if (task_code !== null) {
            newData.task_code = task_code
        }
        if (item_rule_id !== null) {
            newData.item_rule_id = item_rule_id
        }
        var res = await item.updateOne({ item_id: item_id }, newData)
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

module.exports = {
    getRuleTree,
    getItems,
    getItemRule,
    getItemTask,
    createItemRule,
    createRule,
    updateItemRule,
    updateRule,
    getRegionTree,
    getRule,
    deleteRule,
    deleteItemRule,
    getRulePath,
    getRegion,
    getTask,
    getRegionPath,
    updateItem
}