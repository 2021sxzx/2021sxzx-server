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
        if (requestBody.start_time || requestBody.end_time) {
            var s = requestBody.start_time ? parseInt(requestBody.start_time) : 0
            var e = requestBody.end_time ? parseInt(requestBody.end_time) : 9999999999999
            var res = await itemService.getItems({
                item_id: requestBody.item_id,
                task_code: requestBody.task_code,
                item_status: requestBody.item_status,
                item_rule_id: requestBody.item_rule_id
            })
            var r = []
            for (let i = 0; i < res.length; i++) {
                if (parseInt(res[i].create_time) >= s && parseInt(res[i].create_time) <= e) {
                    r.push(res[i])
                }
            }
            return new SuccessModel({ msg: '查询成功', data: r })
        }
        var res = await itemService.getItems({
            item_id: requestBody.item_id,
            task_code: requestBody.task_code,
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
        if (requestBody.start_time || requestBody.end_time) {
            var s = requestBody.start_time ? parseInt(requestBody.start_time) : 0
            var e = requestBody.end_time ? parseInt(requestBody.end_time) : 9999999999999
            var res = await itemService.getItemRule({
                item_rule_id: requestBody.item_rule_id,
                rule_id: requestBody.rule_id,
                region_id: requestBody.region_id,
                return_stake: false
            })
            var r = []
            for (let i = 0; i < res.length; i++) {
                if (parseInt(res[i].create_time) >= s && parseInt(res[i].create_time) <= e) {
                    r.push(res[i])
                }
            }
            return new SuccessModel({ msg: '查询成功', data: r })
        }
        var res = await itemService.getItemRule({
            item_rule_id: requestBody.item_rule_id,
            create_time: requestBody.create_time,
            rule_id: requestBody.rule_id,
            region_id: requestBody.region_id,
            return_stake: false
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
            // console.log(itemrules)
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
            var itemruleids = new Array()
            for (let i = 0; i < itemrules.length; i++) {
                if (!itemruleids.includes(itemrules[i])) {
                    itemruleids.push(itemrules[i].item_rule_id)
                }
            }
            var res = new Array()
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
async function getAllItemsByRegionId(requestBody) {
    try {
        if (requestBody.region_id) {
            var flag = true
            var regions = new Array()
            let root = await itemService.getRegion({ region_id: requestBody.region_id })
            for (let i = 0; i < root.length; i++) {
                if (!regions.includes(root[i].region_id)) {
                    regions.push(root[i].region_id)
                }
            }
            while (flag) {
                let lastLen = regions.length
                for (let i = 0; i < lastLen; i++) {
                    let r = await itemService.getRegion({ parentId: regions[i].region_id })
                    for (let j = 0; j < r.length; j++) {
                        if (!regions.includes(r[j].region_id)) {
                            regions.push(r[j].region_id)
                        }
                    }
                }
                if (regions.length === lastLen) {
                    flag = false
                }
            }
            var itemrules = new Array()
            for (let i = 0; i < regions.length; i++) {
                let r = await itemService.getItemRule({ region_id: regions[i] })
                itemrules = itemrules.concat(r)
            }
            var items = new Array()
            for (let i = 0; i < itemrules.length; i++) {
                let r = await itemService.getItems({
                    item_rule_id: itemrules[i].item_rule_id,
                    item_status: requestBody.item_status,
                    release_time: requestBody.release_time,
                    create_time: requestBody.create_time
                })
                items = items.concat(r)
            }
            return new SuccessModel({ msg: '查询成功', data: items })
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
    var createdRules = []
    try {
        if (requestBody.rules) {
            if (requestBody.rules.length <= 0) {
                throw new Error('数组长度小于等于0')
            }
            //检查桩
            var stakes = await itemService.getRule({ rule_name: 'null', return_stake: true })
            if (stakes.length !== 1) {
                await createRuleStake()
                stakes = await itemService.getRule({ rule_name: 'null', return_stake: true })
            }
            var stake = stakes[0]
            //桩的id就是最大的rule_id，用于后续赋值
            var maxRuleId = parseInt(stake.rule_id)
            //删除桩
            await itemService.deleteRule({ rule_id: stake.rule_id })
            //dict的key是temp_id，value是规则节点
            var dict = new Array()
            //给传入的规则节点创建rule_id
            for (let i = 0; i < requestBody.rules.length; i++) {
                requestBody.rules[i].rule_id = maxRuleId.toString()
                dict[requestBody.rules[i].temp_id] = requestBody.rules[i]
                maxRuleId = maxRuleId + 1
            }
            //修改parentId使它们指向rule_id而不是temp_id
            for (let i = 0; i < requestBody.rules.length; i++) {
                if (dict[requestBody.rules[i].parentId]) {
                    requestBody.rules[i].parentId = dict[requestBody.rules[i].parentId].rule_id
                }
            }
            //创建规则
            for (let i = 0; i < requestBody.rules.length; i++) {
                await itemService.createRule({
                    rule_id: requestBody.rules[i].rule_id,
                    rule_name: requestBody.rules[i].rule_name,
                    parentId: requestBody.rules[i].parentId
                })
                //记录已创建的规则的rule_id
                createdRules.push(requestBody.rules[i].rule_id)
            }
            //创建桩
            await itemService.createRule({
                rule_id: maxRuleId.toString(),
                rule_name: 'null',
                parentId: ''
            })
            //返回真实的rule_id
            var res = new Array()
            for (let i = 0; i < requestBody.rules.length; i++) {
                res.push({
                    rule_id: requestBody.rules[i].rule_id,
                    temp_id: requestBody.rules[i].temp_id
                })
            }
            return new SuccessModel({ msg: '创建规则成功', data: res })
        }
        throw new Error('请求体中需要一个rules属性，且该属性是一个数组')
    } catch (err) {
        if (createdRules.length === requestBody.rules.length) {
            //规则创建成功，只是最后的桩创建失败了，不用管
            var res = new Array()
            for (let i = 0; i < requestBody.rules.length; i++) {
                res.push({
                    rule_id: requestBody.rules[i].rule_id,
                    temp_id: requestBody.rules[i].temp_id
                })
            }
            return new SuccessModel({ msg: '创建规则成功', data: res })
        }
        else {
            //回退全部已创建的规则
            try {
                for (let i = 0; i < createdRules.length; i++) {
                    await itemService.deleteRule({ rule_id: createdRules[i] })
                }
            } catch (error) {
                return new ErrorModel({ msg: '创建规则失败，且回退操作失败，寄！', data: error.message })
            }
        }
        return new ErrorModel({ msg: '创建规则失败', data: err.message })
    }
}

async function createRuleStake() {
    try {
        //先把全部桩删掉
        var stakes = await itemService.getRule({ rule_name: 'null', return_stake: true })
        if (stakes.length > 0) {
            for (let i = 0; i < stakes.length; i++) {
                await itemService.deleteRule({ rule_id: stakes[i].rule_id })
            }
        }
        //找出最大id并创建一个新的桩
        var maxRuleId = 0
        var rules = await itemService.getRule({ return_stake: false })
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
 * 更新规则
 * @param {object} requestBody 
 * @returns 
 */
async function updateRules(requestBody) {
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
                await itemService.updateRule({
                    rule_id: requestBody.rules[i].rule_id,
                    rule_name: requestBody.rules[i].rule_name,
                    parentId: requestBody.rules[i].parentId
                })
            }
            return new SuccessModel({ msg: '更新规则成功' })
        }
        throw new Error('请求体中需要一个rules属性，且该属性是一个数组')
    } catch (err) {
        return new ErrorModel({ msg: '更新规则失败', data: err.message })
    }
}

/**
 * 创建事项规则
 * @param {object} requestBody 
 * @returns 
 */
async function createItemRules(requestBody) {
    var createdItemRules = []
    try {
        if (requestBody.itemRules) {
            //数组长度不能小于等于0
            if (requestBody.itemRules.length <= 0) {
                throw new Error('数组长度小于等于0')
            }
            //先把桩找出来，桩的id就是新创建的事项规则id
            var stakes = await itemService.getItemRule({ rule_id: 'null', region_id: 'null', return_stake: true })
            if (stakes.length !== 1) {
                console.log(stakes.length)
                await createItemRuleStake()
                stakes = await itemService.getItemRule({ rule_id: 'null', region_id: 'null', return_stake: true })
            }
            var stake = stakes[0]
            var maxRuleId = parseInt(stake.item_rule_id)
            //暂时先把桩删掉
            await itemService.deleteItemRule({ item_rule_id: stake.item_rule_id })
            //给要创建的事项规则分配id
            for (let i = 0; i < requestBody.itemRules.length; i++) {
                if (requestBody.itemRules[i].rule_id && requestBody.itemRules[i].region_id) {
                    var r = await itemService.getItemRule({
                        rule_id: requestBody.itemRules[i].rule_id,
                        region_id: requestBody.itemRules[i].region_id
                    })
                    if (r.length > 0) {
                        continue
                    }
                }
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
                //记录已创建的事项规则
                createdItemRules.push(requestBody.itemRules[i].item_rule_id)
            }
            //重新创建一个桩
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
        if (createdItemRules.length === requestBody.itemRules.length) {
            //创建成功了，只是最后创建桩失败，不用管
            return new SuccessModel({ msg: '创建事项规则成功' })
        }
        else {
            //回退所有创建操作
            try {
                for (let i = 0; i < createdItemRules.length; i++) {
                    await itemService.deleteItemRule({ item_rule_id: createdItemRules[i] })
                }
            } catch (error) {
                return new ErrorModel({ msg: '创建事项规则失败，且回退操作失败，寄！', data: error.message })
            }
        }
        return new ErrorModel({ msg: '创建事项规则失败', data: err.message })
    }
}

async function createItemRuleStake() {
    try {
        //先删除全部的桩
        var stakes = await itemService.getItemRule({ rule_id: 'null', region_id: 'null', return_stake: true })
        if (stakes.length > 0) {
            for (let i = 0; i < stakes.length; i++) {
                await itemService.deleteItemRule({ item_rule_id: stakes[i].item_rule_id })
            }
        }
        //找到目前最大的id
        var maxRuleId = 0
        var itemRules = await itemService.getItemRule({ return_stake: false })
        for (let i = 0; i < itemRules.length; i++) {
            let ruleId = parseInt(itemRules[i].item_rule_id)
            if (maxRuleId < ruleId) {
                maxRuleId = ruleId
            }
        }
        maxRuleId = maxRuleId + 1
        //创建一个桩
        await itemService.createItemRule({
            create_time: Date.now(),
            item_rule_id: maxRuleId.toString(),
            rule_id: 'null',
            region_id: 'null'
        })
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
    var deletedItemRules = []   //记录已删除的事项规则，方便在出错时回退删除操作
    var updatedItems = []   //记录已修改的事项，方便在出错时回退更新操作
    try {
        if (requestBody.itemRules) {
            if (requestBody.itemRules.length <= 0) {
                throw new Error('数组长度小于等于0')
            }
            var res = new Array()
            for (let i = 0; i < requestBody.itemRules.length; i++) {
                let rule = await itemService.getItemRule({ item_rule_id: requestBody.itemRules[i].item_rule_id })
                //检查item_rule_id的合法性
                if (rule.length <= 0) {
                    throw new Error('item_rule_id不存在: ' + requestBody.itemRules[i].item_rule_id)
                }
                else {
                    if (rule[0].rule_id === 'null' || rule[0].region_id === 'null') {
                        throw new Error('item_rule_id违法: ' + requestBody.itemRules[i].item_rule_id)
                    }
                }
                //根据传入的item_rule_id删除事项规则
                await itemService.deleteItemRule({ item_rule_id: requestBody.itemRules[i].item_rule_id })
                //记录事项规则删除之前的状态
                deletedItemRules.push(rule[0])
                //把相关的item的item_rule_id设为空字符串，并返回所有受影响的item
                let items = await itemService.getItems({ item_rule_id: requestBody.itemRules[i].item_rule_id })
                for (let j = 0; j < items.length; j++) {
                    //更新相关的事项，把它们绑定的事项规则id设为空字符串
                    await itemService.updateItem({ item_id: items[j].item_id, item_rule_id: '' })
                    //记录事项更新之前的状态
                    updatedItems.push(items[j])
                    //修改，不再访问数据库
                    items[j].item_rule_id = ''
                }
                //加到最终返回结果中
                res.concat(items)
            }
            return new SuccessModel({ msg: '删除事项规则成功', data: res })
        }
        throw new Error('请求体中需要一个itemRules属性，且该属性是一个数组')
    } catch (err) {
        //回退所有操作
        try {
            for (let i = 0; i < deletedItemRules.length; i++) {
                let itemrule = deletedItemRules[i]
                await itemService.createItemRule({
                    create_time: itemrule.create_time,
                    item_rule_id: itemrule.item_rule_id,
                    rule_id: itemrule.rule_id,
                    region_id: itemrule.region_id
                })
            }
            for (let i = 0; i < updatedItems.length; i++) {
                let item = updatedItems[i]
                await itemService.updateItem({
                    item_id: item.item_id,
                    item_rule_id: item.item_rule_id
                })
            }
        } catch (error) {
            return new ErrorModel({ msg: '删除事项规则失败，且回退操作失败，寄！', data: error.message })
        }
        return new ErrorModel({ msg: '删除事项规则失败', data: err.message })
    }
}

/**
 * 更新事项规则
 * @param {object} requestBody 
 * @returns 
 */
async function updateItemRules(requestBody) {
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
                await itemService.updateItemRule({
                    item_rule_id: requestBody.itemRules[i].item_rule_id,
                    rule_id: requestBody.itemRules[i].rule_id,
                    region_id: requestBody.itemRules[i].region_id
                })
            }
            return new SuccessModel({ msg: '更新事项规则成功' })
        }
        throw new Error('请求体中需要一个itemRules属性，且该属性是一个数组')
    } catch (err) {
        return new ErrorModel({ msg: '更新事项规则失败', data: err.message })
    }
}

/**
 * 通过rule_id获取对应的规则路径
 * @param {object} requestBody 
 * @returns 
 */
async function getRulePath(requestBody) {
    try {
        if (requestBody.ruleIds) {
            if (requestBody.ruleIds.length <= 0) {
                throw new Error('数组长度小于等于0')
            }
            var res = {}
            for (let i = 0; i < requestBody.ruleIds.length; i++) {
                let rulePath = await itemService.getRulePath({ rule_id: requestBody.ruleIds[i] })
                res[requestBody.ruleIds[i]] = rulePath
            }
            return new SuccessModel({ msg: '获取规则路径成功', data: res })
        }
        throw new Error('请求体中需要一个ruleIds属性，且该属性是一个数组')
    } catch (err) {
        return new ErrorModel({ msg: '获取规则路径失败', data: err.message })
    }
}

/**
 * 通过item_rule_id获取对应的规则路径
 * @param {object} requestBody 
 * @returns 
 */
async function getItemRulePath(requestBody) {
    try {
        if (requestBody.itemRuleIds) {
            if (requestBody.itemRuleIds.length <= 0) {
                throw new Error('数组长度小于等于0')
            }
            var res = {}
            for (let i = 0; i < requestBody.itemRuleIds.length; i++) {
                let itemRule = await itemService.getItemRule({ item_rule_id: requestBody.itemRuleIds[i] })
                if (itemRule.length <= 0) {
                    throw new Error('item_rule_id不存在: ' + requestBody.itemRuleIds[i])
                }
                else {
                    if (itemRule[0].rule_id === 'null') {
                        throw new Error('item_rule_id违法: ' + requestBody.itemRuleIds[i])
                    }
                    let rulePath = await itemService.getRulePath({ rule_id: itemRule[0].rule_id })
                    res[requestBody.itemRuleIds[i]] = rulePath
                }
            }
            return new SuccessModel({ msg: '获取事项规则路径成功', data: res })
        }
        throw new Error('请求体中需要一个itemRuleIds属性，且该属性是一个数组')
    } catch (err) {
        return new ErrorModel({ msg: '获取事项规则路径失败', data: err.message })
    }
}

/**
 * 获取规则
 * @param {object} requestBody 
 * @returns 
 */
async function getRules(requestBody) {
    try {
        var res = await itemService.getRule({
            rule_id: requestBody.rule_id,
            rule_name: requestBody.rule_name,
            parentId: requestBody.parentId,
            return_stake: false
        })
        return new SuccessModel({ msg: '获取规则成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '获取规则失败', data: err.message })
    }
}

/**
 * 获取事项指南
 * @param {object} requestBody 
 * @returns 
 */
async function getItemGuide(requestBody) {
    try {
        if (requestBody.task_code) {
            var res = await itemService.getTask({ task_code: requestBody.task_code })
            return new SuccessModel({ msg: '查询成功', data: res })
        }
        throw new Error('需要task_code字段')
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 获取区划路径
 * @param {object} requestBody 
 * @returns 
 */
async function getRegionPath(requestBody) {
    try {
        if (requestBody.regionIds) {
            if (requestBody.regionIds.length <= 0) {
                throw new Error('数组长度小于等于0')
            }
            var res = {}
            for (let i = 0; i < requestBody.regionIds.length; i++) {
                let regionPath = await itemService.getRegionPath({ region_id: requestBody.regionIds[i] })
                res[requestBody.regionIds[i]] = regionPath
            }
            return new SuccessModel({ msg: '获取区划路径成功', data: res })
        }
        throw new Error('请求体中需要一个regionIds属性，且该属性是一个数组')
    } catch (err) {
        return new ErrorModel({ msg: '获取区划路径失败', data: err.message })
    }
}

async function getRegions(requestBody) {
    try {
        var regions = await itemService.getRegion({
            region_id: requestBody.region_id,
            region_name: requestBody.region_name,
            region_level: requestBody.region_level,
            parentId: requestBody.parentId
        })
        return new SuccessModel({ msg: '获取区划成功', data: regions })
    } catch (err) {
        return new ErrorModel({ msg: '获取区划失败', data: err.message })
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
    deleteItemRules,
    getRulePath,
    getItemRulePath,
    getRules,
    getAllItemsByRegionId,
    getItemGuide,
    getRegionPath,
    updateRules,
    updateItemRules,
    getRegions
}