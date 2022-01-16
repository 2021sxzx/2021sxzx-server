const rule = require('../model/rule')
const item = require('../model/item')
const itemRule = require('../model/itemRule')
const task = require('../model/task')
const region = require('../model/region')

/**
 * 获取规则树
 * @returns 数组
 */
async function getRuleTree() {
    try {
        var rules = await rule.find().ne('rule_name', 'null')
        var res = []
        for (let i = 0; i < rules.length; i++) {
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

async function getRegionTree() {
    try {
        var res = await region.find().projection({ _id: 0 })
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

async function getItems({ item_id, release_time, item_status, create_time, task_code, item_rule_id }) {
    try {
        var query = {}
        if (item_id) query.item_id = item_id
        if (release_time) query.release_time = release_time
        if (item_status) query.item_status = item_status
        if (create_time) query.create_time = create_time
        if (task_code) query.task_code = task_code
        if (item_rule_id) query.item_rule_id = item_rule_id
        var res = await item.find(query).projection({ _id: 0 })
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

async function getItemTask({ item_id }) {
    try {
        var res = await item.where('item_id').equals(item_id).projection({ _id: 0 })
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

async function getTasks({ task_code, task_name }) {
    try {
        var query = {}
        if (task_code) query.task_code = task_code
        if (task_name) query.task_name = task_name
        var res = await task.find(query).projection({ _id: 0 })
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

async function getItemRule({ create_time, item_rule_id, rule_id, region_id }) {
    try {
        var query = {}
        if (create_time) query.create_time = create_time
        if (item_rule_id) query.item_rule_id = item_rule_id
        if (rule_id) query.rule_id = rule_id
        if (region_id) query.region_id = region_id
        var res = await itemRule.find(query).projection({ _id: 0 })
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

async function getRule({ rule_id, rule_name, parentId }) {
    try {
        var query = {}
        if (rule_id) query.rule_id = rule_id
        if (rule_name) query.rule_name = rule_name
        if (parentId) query.parentId = parentId
        var res = await rule.find(query).projection({ _id: 0 })
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

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
    getRule
}