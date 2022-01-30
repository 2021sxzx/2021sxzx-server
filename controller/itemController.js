const itemService = require('../service/itemService')
const { ErrorModel, SuccessModel } = require('../utils/resultModel')

/**
 * 获取规则树
 * @returns 
 */
async function getRuleTree() {
    try {
        var res = await itemService.getRuleTree()
        return new SuccessModel({ msg: '获取规则树成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '获取规则树失败', data: err.message })
    }
}

/**
 * 获取区划树
 * @returns 
 */
async function getRegionTree() {
    try {
        var res = await itemService.getRegionTree()
        return new SuccessModel({ msg: '获取区划树成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '获取区划树失败', data: err.message })
    }
}

/**
 * 根据唯一id获取事项
 * @param {object} requestBody 
 * @returns 
 */
async function getItemByUniId(requestBody) {
    try {
        if (requestBody.item_id) {
            var res = await itemService.getItems({ item_id: requestBody.item_id })
            return new SuccessModel({ msg: '查询成功', data: res })
        }
        else if (requestBody.task_code) {
            var res = await itemService.getItems({ task_code: requestBody.task_code })
            return new SuccessModel({ msg: '查询成功', data: res })
        }
        throw new Error('需要item_id或者task_code')
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 获取事项
 * @param {object} requestBody 
 * @returns 
 */
async function getItems(requestBody) {
    try {
        var res = await itemService.getItems({
            release_time: requestBody.release_time,
            item_status: requestBody.item_status,
            create_time: requestBody.create_time,
            item_rule_id: requestBody.item_rule_id
        })
        return new SuccessModel({ msg: '查询成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 获取事项规则
 * @param {object} requestBody 
 * @returns 
 */
async function getItemRules(requestBody) {
    try {
        var res = await itemService.getItemRule({
            item_rule_id: requestBody.item_rule_id,
            create_time: requestBody.create_time,
            rule_id: requestBody.rule_id,
            region_id: requestBody.region_id
        })
        return new SuccessModel({ msg: '查询成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 根据规则id获取事项
 * @param {object} requestBody 
 * @returns 
 */
async function getItemsByRuleId(requestBody) {
    try {
        if (requestBody.rule_id) {
            var itemrules = await itemService.getItemRule({ rule_id: requestBody.rule_id })
            var itemruleids = []
            for (let i = 0; i < itemrules.length; i++) {
                if (!itemruleids.includes(itemrules[i].item_rule_id)) {
                    itemruleids.push(itemrules[i].item_rule_id)
                }
            }
            var res = []
            for (let i = 0; i < itemruleids.length; i++) {
                let r = await itemService.getItems({
                    item_rule_id: itemruleids[i],
                    item_status: requestBody.item_status,
                    release_time: requestBody.release_time,
                    create_time: requestBody.create_time
                })
                res = res.concat(r)
            }
            return new SuccessModel({ msg: '查询成功', data: res })
        }
        throw new Error('需要rule_id')
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 根据区划id获取该区划的事项
 * @param {object} requestBody 
 * @returns 
 */
async function getItemsByRegionId(requestBody) {
    try {
        if (requestBody.region_id) {
            var itemrules = await itemService.getItemRule({ region_id: requestBody.region_id })
            var itemruleids = []
            for (let i = 0; i < itemrules.length; i++) {
                if (!itemruleids.includes(itemrules[i])) {
                    itemruleids.push(itemrules[i].item_rule_id)
                }
            }
            var res = []
            for (let i = 0; i < itemruleids.length; i++) {
                let r = await itemService.getItems({
                    item_rule_id: itemruleids[i],
                    item_status: requestBody.item_status,
                    release_time: requestBody.release_time,
                    create_time: requestBody.create_time
                })
                res = res.concat(r)
            }
            return new SuccessModel({ msg: '查询成功', data: res })
        }
        throw new Error('至少需要region_id')
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 根据区划id获取该区划以及下级区划的全部事项
 * @param {object} requestBody 
 * @returns 
 */
async function getItemsIncludeChildRegions(requestBody) {
    try {
        if (requestBody.region_id) {

        }
        throw new Error('至少需要region_id')
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 创建规则
 * @param {object} requestBody 
 * @returns 
 */
async function createRules(requestBody) {
    try {
        if (requestBody.rules) {
            if (requestBody.rules.length <= 0) {
                throw new Error('数组长度小于等于0')
            }
            var stakes = await itemService.getRule({ rule_name: 'null' })
            if (stakes.length !== 1) {
                await createRuleStake()
                stakes = await itemService.getRule({ rule_name: 'null' })
            }
            var stake = stakes[0]
            var maxRuleId = parseInt(stake.rule_id)
            await itemService.deleteRule({ rule_id: stake.rule_id })
            var dict = new Array()
            for (let i = 0; i < requestBody.rules.length; i++) {
                requestBody.rules[i].rule_id = maxRuleId.toString()
                dict[requestBody.rules[i].temp_id] = requestBody.rules[i]
                maxRuleId = maxRuleId + 1
            }
            for (let i = 0; i < requestBody.rules.length; i++) {
                if (dict[requestBody.rules[i].parentId]) {
                    requestBody.rules[i].parentId = dict[requestBody.rules[i].parentId].rule_id
                }
            }
            for (let i = 0; i < requestBody.rules.length; i++) {
                await itemService.createRule({
                    rule_id: requestBody.rules[i].rule_id,
                    rule_name: requestBody.rules[i].rule_name,
                    parentId: requestBody.rules[i].parentId
                })
            }
            await itemService.createRule({
                rule_id: maxRuleId.toString(),
                rule_name: 'null',
                parentId: ''
            })
            return new SuccessModel({ msg: '创建规则成功' })
        }
        throw new Error('请求体中需要一个rules属性，且该属性是一个数组')
    } catch (err) {
        try {
            await createRuleStake()
        } catch (e) {
            return new ErrorModel({ msg: '创建规则失败', data: e.message })
        }
        return new ErrorModel({ msg: '创建规则失败', data: err.message })
    }
}

async function createRuleStake() {
    try {
        var maxRuleId = 0
        var rules = await itemService.getRule({})
        for (let i = 0; i < rules.length; i++) {
            let ruleId = parseInt(rules[i].rule_id)
            if (maxRuleId < ruleId && rules[i].rule_name !== 'null') {
                maxRuleId = ruleId
            }
        }
        maxRuleId = maxRuleId + 1
        await itemService.createRule({
            rule_id: maxRuleId.toString(),
            rule_name: 'null',
            parentId: ''
        })
        var stakes = await itemService.getRule({ rule_name: 'null' })
        if (stakes.length > 1) {
            let maxStakeId = 0
            for (let i = 0; i < stakes.length; i++) {
                if (parseInt(stakes[i].rule_id) <= maxStakeId) {
                    await itemService.deleteRule({ rule_id: stakes[i].rule_id })
                }
                else {
                    maxStakeId = parseInt(stakes[i].rule_id)
                }
            }
        }
    } catch (err) {
        throw new Error('联系管理员检查数据库的rule表，确保rule_name为null的桩存在且rule_id是最大值')
    }
}

/**
 * 删除规则
 * @param {object} requestBody 
 * @returns 
 */
async function deleteRules(requestBody) {
    try {
        if (requestBody.rules) {
            if (requestBody.rules.length <= 0) {
                throw new Error('数组长度小于等于0')
            }
            for (let i = 0; i < requestBody.rules.length; i++) {
                let rule = await itemService.getRule({ rule_id: requestBody.rules[i].rule_id })
                if (rule.length <= 0) {
                    throw new Error('rule_id不存在: ' + requestBody.rules[i].rule_id)
                }
                else {
                    if (rule[0].rule_name === 'null') {
                        throw new Error('rule_id违法: ' + requestBody.rules[i].rule_id)
                    }
                }
                await itemService.deleteRule({ rule_id: requestBody.rules[i].rule_id })
            }
            return new SuccessModel({ msg: '删除规则成功' })
        }
        throw new Error('请求体中需要一个rules属性，且该属性是一个数组')
    } catch (err) {
        return new ErrorModel({ msg: '删除规则失败', data: err.message })
    }
}

/**
 * 创建事项规则
 * @param {object} requestBody 
 * @returns 
 */
async function createItemRules(requestBody) {
    try {
        if (requestBody.itemRules) {
            if (requestBody.itemRules.length <= 0) {
                throw new Error('数组长度小于等于0')
            }
            var stakes = await itemService.getItemRule({ rule_id: 'null', region_id: 'null' })
            if (stakes.length !== 1) {
                await createItemRuleStake()
                stakes = await itemService.getItemRule({ rule_id: 'null', region_id: 'null' })
            }
            var stake = stakes[0]
            var maxRuleId = parseInt(stake.item_rule_id)
            await itemService.deleteItemRule({ item_rule_id: stake.item_rule_id })
            for (let i = 0; i < requestBody.itemRules.length; i++) {
                requestBody.itemRules[i].item_rule_id = maxRuleId.toString()
                maxRuleId = maxRuleId + 1
            }
            for (let i = 0; i < requestBody.itemRules.length; i++) {
                await itemService.createItemRule({
                    create_time: Date.now(),
                    item_rule_id: requestBody.itemRules[i].item_rule_id,
                    rule_id: requestBody.itemRules[i].rule_id ? requestBody.itemRules[i].rule_id : '',
                    region_id: requestBody.itemRules[i].region_id ? requestBody.itemRules[i].region_id : ''
                })
            }
            await itemService.createItemRule({
                create_time: Date.now(),
                item_rule_id: maxRuleId.toString(),
                rule_id: 'null',
                region_id: 'null'
            })
            return new SuccessModel({ msg: '创建事项规则成功' })
        }
        throw new Error('请求体中需要一个itemRules属性，且该属性是一个数组')
    } catch (err) {
        try {
            await createItemRuleStake()
        } catch (e) {
            return new ErrorModel({ msg: '创建事项规则失败', data: e.message })
        }
        return new ErrorModel({ msg: '创建事项规则失败', data: err.message })
    }
}

async function createItemRuleStake() {
    try {
        var maxRuleId = 0
        var itemRules = await itemService.getItemRule({})
        for (let i = 0; i < itemRules.length; i++) {
            let ruleId = parseInt(itemRules[i].item_rule_id)
            if (maxRuleId < ruleId && itemRules[i].rule_id !== 'null' && itemRules[i].region_id !== 'null') {
                maxRuleId = ruleId
            }
        }
        maxRuleId = maxRuleId + 1
        await itemService.createItemRule({
            create_time: Date.now(),
            item_rule_id: maxRuleId.toString(),
            rule_id: 'null',
            region_id: 'null'
        })
        var stakes = await itemService.getItemRule({ rule_id: 'null', region_id: 'null' })
        if (stakes.length > 1) {
            let maxStakeId = 0
            for (let i = 0; i < stakes.length; i++) {
                if (parseInt(stakes[i].item_rule_id) <= maxStakeId) {
                    await itemService.deleteItemRule({ item_rule_id: stakes[i].item_rule_id })
                }
                else {
                    maxStakeId = parseInt(stakes[i].item_rule_id)
                }
            }
        }
    } catch (err) {
        throw new Error('联系管理员检查数据库的item_rule表，确保rule_id和region_id为null的桩存在且item_rule_id是最大值')
    }
}

/**
 * 删除事项规则
 * @param {object} requestBody 
 * @returns 
 */
async function deleteItemRules(requestBody) {
    try {
        if (requestBody.itemRules) {
            if (requestBody.itemRules.length <= 0) {
                throw new Error('数组长度小于等于0')
            }
            for (let i = 0; i < requestBody.itemRules.length; i++) {
                let rule = await itemService.getItemRule({ item_rule_id: requestBody.itemRules[i].item_rule_id })
                if (rule.length <= 0) {
                    throw new Error('item_rule_id不存在: ' + requestBody.itemRules[i].item_rule_id)
                }
                else {
                    if (rule[0].rule_name === 'null') {
                        throw new Error('item_rule_id违法: ' + requestBody.itemRules[i].item_rule_id)
                    }
                }
                await itemService.deleteItemRule({ item_rule_id: requestBody.itemRules[i].item_rule_id })
            }
            return new SuccessModel({ msg: '删除事项规则成功' })
        }
        throw new Error('请求体中需要一个itemRules属性，且该属性是一个数组')
    } catch (err) {
        return new ErrorModel({ msg: '删除事项规则失败', data: err.message })
    }
}

module.exports = {
    getRuleTree,
    getRegionTree,
    getItemByUniId,
    getItems,
    getItemsByRuleId,
    getItemsByRegionId,
    createRules,
    deleteRules,
    getItemRules,
    createItemRules,
    deleteItemRules
}