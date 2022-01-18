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
 * 根据区划id获取事项
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
        throw new Error('至少需要region_id')
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

module.exports = {
    getRuleTree,
    getRegionTree
}