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
async function getItems({ item_id, release_time, item_status, create_time, task_code, item_rule_id }) {
    try {
        var query = {}
        if (item_id) query.item_id = item_id
        if (release_time) query.release_time = release_time
        if (item_status) query.item_status = item_status
        if (create_time) query.create_time = create_time
        if (task_code) query.task_code = task_code
        if (item_rule_id) query.item_rule_id = item_rule_id
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
async function getItemTask({ item_id }) {
    try {
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
async function getTasks({ task_code, task_name }) {
    try {
        var query = {}
        if (task_code) query.task_code = task_code
        if (task_name) query.task_name = task_name
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
async function getItemRule({ create_time, item_rule_id, rule_id, region_id }) {
    try {
        var query = {}
        if (create_time) query.create_time = create_time
        if (item_rule_id) query.item_rule_id = item_rule_id
        if (rule_id) query.rule_id = rule_id
        if (region_id) query.region_id = region_id
        var itemrules = await itemRule.find(query)
        var res = []
        for (let i = 0; i < itemrules.length; i++) {
            if (itemrules[i].rule_id === 'null' && itemrules[i].region_id === 'null') {
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
async function getRule({ rule_id, rule_name, parentId }) {
    try {
        var query = {}
        if (rule_id) query.rule_id = rule_id
        if (rule_name) query.rule_name = rule_name
        if (parentId) query.parentId = parentId
        var rules = await rule.find(query)
        var res = []
        for (let i = 0; i < rules.length; i++) {
            if (rules[i].rule_name === 'null') {
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
async function createItemRule({ create_time, item_rule_id, rule_id, region_id }) {
    try {
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
async function createRule({ rule_id, rule_name, parentId }) {
    try {
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
async function updateItemRule({ create_time, item_rule_id, rule_id, region_id }) {
    try {
        var newData = {}
        if (create_time) newData.create_time = create_time
        if (rule_id) newData.rule_id = rule_id
        if (region_id) newData.region_id = region_id
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
async function updateRule({ rule_id, rule_name, parentId }) {
    try {
        var newData = {}
        if (rule_name) newData.rule_name = rule_name
        if (parentId) newData.parentId = parentId
        var res = await rule.updateOne({ rule_id: rule_id }, newData)
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

async function deleteRule({ rule_id }) {
    try {
        var res = await rule.deleteOne({ rule_id: rule_id })
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

async function deleteItemRule({ item_rule_id }) {
    try {
        var res = await itemRule.deleteOne({ item_rule_id: item_rule_id })
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

async function getRulePath({ rule_id }) {
    try {
        var res = []
        do {
            let r = await rule.findOne({ rule_id: rule_id })
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

async function getRegionPath({ region_id }) {
    try {
        var res = []
        do {
            let r = await region.findOne({ region_id: region_id })
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

async function getRegion({ region_id, region_name, region_level, parentId }) {
    try {
        var query = {}
        if (region_id) query.region_id = region_id
        if (region_name) query.region_name = region_name
        if (region_level) query.region_level = region_level
        if (parentId) query.parentId = parentId
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

async function getTask({ task_code }) {
    try {
        var res = await task.findOne({ task_code: task_code })
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
    getRegionPath
}