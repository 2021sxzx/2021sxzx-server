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
                if (!itemruleids.includes(itemrules[i])) {
                    itemruleids.push(itemrules[i])
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
        throw new Error('至少需要rule_id')
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
            var stake = itemService.getRule({ rule_name: 'null' })
            var maxRuleId = parseInt(stake.rule_id)
            await itemService.deleteRule({ rule_id: stake.rule_id })
            var dict = []
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
        var stake = await itemService.getRule({ rule_name: 'null' })
        if (!stake || stake.length <= 0) {
            var maxRuleId = 0
            var rules = itemService.getRule({})
            for (let i = 0; i < rules.length; i++) {
                let ruleId = parseInt(rules[i].rule_id)
                if (maxRuleId < ruleId) {
                    maxRuleId = ruleId
                }
            }
            maxRuleId = maxRuleId + 1
            await itemService.createRule({
                rule_id: maxRuleId.toString(),
                rule_name: 'null',
                parentId: ''
            })
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
                await itemService.deleteRule({ rule_id: requestBody.rules[i].rule_id })
            }
            return new SuccessModel({ msg: '删除规则成功' })
        }
        throw new Error('请求体中需要一个rules属性，且该属性是一个数组')
    } catch (err) {
        return new ErrorModel({ msg: '删除规则失败', data: err.message })
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
    deleteRules
}