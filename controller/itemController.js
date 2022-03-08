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
 * @param {string} item_id 事项id
 * @param {string} task_code 事项指南实施编码
 * @returns 
 */
async function getItemByUniId({
    item_id = null,
    task_code = null
}) {
    try {
        if (item_id === null && task_code === null) {
            throw new Error('需要item_id或者task_code')
        }
        else if (item_id !== null) {
            var res = await itemService.getItems({ item_id: item_id })
            return new SuccessModel({ msg: '查询成功', data: res })
        }
        else if (task_code !== null) {
            var res = await itemService.getItems({ task_code: task_code })
            return new SuccessModel({ msg: '查询成功', data: res })
        }
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 获取事项
 * @param {string} start_time 事项创建时间的起始时间
 * @param {string} end_time 事项创建时间的终止时间
 * @param {string} item_id 事项id
 * @param {string} task_code 事项指南实施编码
 * @param {number} item_status 事项状态
 * @param {string} item_rule_id 事项规则id
 * @param {string} release_time 事项发布时间
 * @param {string} create_time 事项创建时间
 * @returns 
 */
async function getItems({
    start_time = null,
    end_time = null,
    item_id = null,
    task_code = null,
    item_status = null,
    item_rule_id = null,
    release_time = null,
    create_time = null
}) {
    try {
        if (start_time !== null || end_time !== null) {
            var s = (start_time !== null || start_time !== '') ? start_time : 0
            var e = (end_time !== null || end_time !== '') ? end_time : 9999999999999
            var res = await itemService.getItems({
                item_id: item_id,
                task_code: task_code,
                item_status: item_status,
                item_rule_id: item_rule_id
            })
            var r = []
            for (let i = 0; i < res.length; i++) {
                if (res[i].create_time >= s && res[i].create_time <= e) {
                    r.push(res[i])
                }
            }
            return new SuccessModel({ msg: '查询成功', data: r })
        }
        var res = await itemService.getItems({
            item_id: item_id,
            task_code: task_code,
            release_time: release_time,
            item_status: item_status,
            create_time: create_time,
            item_rule_id: item_rule_id
        })
        return new SuccessModel({ msg: '查询成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 获取事项规则
 * @param {string} start_time 事项规则创建时间的起始时间
 * @param {string} end_time 事项规则创建时间的终止时间
 * @param {string} item_rule_id 事项规则id
 * @param {string} rule_id 规则id
 * @param {string} region_id 区划id
 * @param {string} create_time 事项规则创建时间
 * @returns 
 */
async function getItemRules({
    start_time = null,
    end_time = null,
    item_rule_id = null,
    rule_id = null,
    region_id = null,
    create_time = null
}) {
    try {
        if (start_time !== null || end_time !== null) {
            var s = (start_time !== null || start_time !== '') ? start_time : 0
            var e = (end_time !== null || end_time !== '') ? end_time : 9999999999999
            var res = await itemService.getItemRules({
                item_rule_id: item_rule_id,
                rule_id: rule_id,
                region_id: region_id,
                return_stake: false
            })
            var r = []
            for (let i = 0; i < res.length; i++) {
                if (res[i].create_time >= s && res[i].create_time <= e) {
                    r.push(res[i])
                }
            }
            return new SuccessModel({ msg: '查询成功', data: r })
        }
        var res = await itemService.getItemRules({
            item_rule_id: item_rule_id,
            create_time: create_time,
            rule_id: rule_id,
            region_id: region_id,
            return_stake: false
        })
        return new SuccessModel({ msg: '查询成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 根据规则id获取事项
 * @param {string} rule_id 规则id 
 * @param {number} item_status 事项状态
 * @param {string} release_time 事项发布时间
 * @param {string} create_time 事项创建时间
 * @returns 
 */
async function getItemsByRuleId({
    rule_id = null,
    item_status = null,
    release_time = null,
    create_time = null
}) {
    try {
        if (rule_id === null) {
            throw new Error('需要rule_id')
        }
        var itemrules = await itemService.getItemRules({
            rule_id: rule_id,
            return_stake: false
        })
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
                item_status: item_status,
                release_time: release_time,
                create_time: create_time
            })
            res = res.concat(r)
        }
        return new SuccessModel({ msg: '查询成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 根据区划id获取该区划的事项
 * @param {string} region_id 区划id
 * @param {number} item_status 事项状态
 * @param {string} release_time 事项发布时间
 * @param {string} create_time 事项创建时间
 * @returns 
 */
async function getItemsByRegionId({
    region_id = null,
    item_status = null,
    release_time = null,
    create_time = null
}) {
    try {
        if (region_id === null) {
            throw new Error('至少需要region_id')
        }
        var itemrules = await itemService.getItemRules({
            region_id: region_id,
            return_stake: false
        })
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
                item_status: item_status,
                release_time: release_time,
                create_time: create_time
            })
            res = res.concat(r)
        }
        return new SuccessModel({ msg: '查询成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 根据区划id获取该区划以及下级区划的全部事项
 * @param {string} region_id 区划id
 * @param {number} item_status 事项状态
 * @param {string} release_time 事项发布时间
 * @param {string} create_time 事项创建时间
 * @returns 
 */
async function getAllItemsByRegionId({
    region_id = null,
    item_status = null,
    release_time = null,
    create_time = null
}) {
    try {
        if (region_id === null) {
            throw new Error('至少需要region_id')
        }
        var flag = true
        var regions = new Array()
        let root = await itemService.getRegion({ region_id: region_id })
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
            let r = await itemService.getItemRules({ region_id: regions[i], return_stake: false })
            itemrules = itemrules.concat(r)
        }
        var items = new Array()
        for (let i = 0; i < itemrules.length; i++) {
            let r = await itemService.getItems({
                item_rule_id: itemrules[i].item_rule_id,
                item_status: item_status,
                release_time: release_time,
                create_time: create_time
            })
            items = items.concat(r)
        }
        return new SuccessModel({ msg: '查询成功', data: items })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 创建规则
 * @param {Array} rules 待创建的规则
 * @returns 
 */
async function createRules({
    rules = null
}) {
    var createSuccess = false
    try {
        if (rules === null) {
            throw new Error('请求体中需要一个rules属性，且该属性是一个数组')
        }
        if (rules.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        //检查桩
        var stakes = await itemService.getRules({ rule_name: 'null', return_stake: true })
        if (stakes.length !== 1) {
            await createRuleStake()
            stakes = await itemService.getRules({ rule_name: 'null', return_stake: true })
        }
        var stake = stakes[0]
        //桩的id就是最大的rule_id，用于后续赋值
        var maxRuleId = parseInt(stake.rule_id)
        //删除桩
        await itemService.deleteRule({ rule_id: stake.rule_id })
        //dict的key是temp_id，value是规则节点
        var dict = new Array()
        //给传入的规则节点创建rule_id
        for (let i = 0; i < rules.length; i++) {
            rules[i].rule_id = maxRuleId.toString()
            dict[rules[i].temp_id] = rules[i]
            maxRuleId = maxRuleId + 1
        }
        //修改parentId使它们指向rule_id而不是temp_id
        for (let i = 0; i < rules.length; i++) {
            if (dict[rules[i].parentId]) {
                rules[i].parentId = dict[rules[i].parentId].rule_id
            }
        }
        //创建规则
        var arr = new Array()
        for (let i = 0; i < rules.length; i++) {
            arr.push({
                rule_id: rules[i].rule_id,
                rule_name: rules[i].rule_name,
                parentId: rules[i].parentId
            })
        }
        await itemService.createRules(arr)
        createSuccess = true
        //创建桩
        await itemService.createRule({
            rule_id: maxRuleId.toString(),
            rule_name: 'null',
            parentId: ''
        })
        //返回真实的rule_id
        var res = new Array()
        for (let i = 0; i < rules.length; i++) {
            res.push({
                rule_id: rules[i].rule_id,
                temp_id: rules[i].temp_id
            })
        }
        return new SuccessModel({ msg: '创建规则成功', data: res })
    } catch (err) {
        if (createSuccess === true) {
            //规则创建成功，只是最后的桩创建失败了，不用管
            var res = new Array()
            for (let i = 0; i < rules.length; i++) {
                res.push({
                    rule_id: rules[i].rule_id,
                    temp_id: rules[i].temp_id
                })
            }
            return new SuccessModel({ msg: '创建规则成功', data: res })
        }
        return new ErrorModel({ msg: '创建规则失败', data: err.message })
    }
}

async function createRuleStake() {
    try {
        //先把全部桩删掉
        var stakes = await itemService.getRules({ rule_name: 'null', return_stake: true })
        if (stakes.length > 0) {
            for (let i = 0; i < stakes.length; i++) {
                await itemService.deleteRule({ rule_id: stakes[i].rule_id })
            }
        }
        //找出最大id并创建一个新的桩
        var maxRuleId = 0
        var rules = await itemService.getRules({ return_stake: false })
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
 * @param {Array} rules 待删除的规则
 * @returns 
 */
async function deleteRules({
    rules = null
}) {
    var deletedRules = []
    try {
        if (rules === null) {
            throw new Error('请求体中需要一个rules属性，且该属性是一个数组')
        }
        if (rules.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        for (let i = 0; i < rules.length; i++) {
            //判断rule_id的合法性
            let rule = await itemService.getRules({ rule_id: rules[i], return_stake: true })
            if (rule.length <= 0) {
                throw new Error('rule_id不存在: ' + rules[i])
            }
            else {
                if (rule[0].rule_name === 'null') {
                    throw new Error('rule_id违法: ' + rules[i])
                }
            }
            await itemService.deleteRule({ rule_id: rules[i] })
            deletedRules.push(rule[0])
        }
        return new SuccessModel({ msg: '删除规则成功' })
    } catch (err) {
        if (deletedRules.length > 0) {
            var str = '数据库出错，只删除了部分规则：\n'
            for (let i = 0; i < deletedRules.length; i++) {
                str = str + deletedRules[i].rule_name + '\n'
            }
            return new ErrorModel({ msg: '批量删除规则失败', data: str })
        }
        return new ErrorModel({ msg: '删除规则失败', data: err.message })
    }
}

/**
 * 更新规则
 * @param {Array} rules 待更新的规则
 * @returns 
 */
async function updateRules({
    rules = null
}) {
    try {
        if (rules === null) {
            throw new Error('请求体中需要一个rules属性，且该属性是一个数组')
        }
        if (rules.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        for (let i = 0; i < rules.length; i++) {
            //判断rule_id的合法性
            let rule = await itemService.getRules({ rule_id: rules[i].rule_id, return_stake: true })
            if (rule.length <= 0) {
                throw new Error('rule_id不存在: ' + rules[i].rule_id)
            }
            else {
                if (rule[0].rule_name === 'null') {
                    throw new Error('rule_id违法: ' + rules[i].rule_id)
                }
            }
            //更新rule
            await itemService.updateRule({
                rule_id: rules[i].rule_id,
                rule_name: rules[i].rule_name,
                parentId: rules[i].parentId
            })
        }
        return new SuccessModel({ msg: '更新规则成功' })
    } catch (err) {
        return new ErrorModel({ msg: '更新规则失败', data: err.message })
    }
}

/**
 * 创建事项规则
 * @param {Array} itemRules 待创建的事项规则
 * @returns 
 */
async function createItemRules({
    itemRules = null
}) {
    var createSuccess = false
    try {
        if (itemRules === null) {
            throw new Error('请求体中需要一个itemRules属性，且该属性是一个数组')
        }
        //数组长度不能小于等于0
        if (itemRules.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        //先把桩找出来，桩的id就是新创建的事项规则id
        var stakes = await itemService.getItemRules({ rule_id: 'null', region_id: 'null', return_stake: true })
        if (stakes.length !== 1) {
            await createItemRuleStake()
            stakes = await itemService.getItemRules({ rule_id: 'null', region_id: 'null', return_stake: true })
        }
        var stake = stakes[0]
        var maxRuleId = parseInt(stake.item_rule_id)
        //暂时先把桩删掉
        await itemService.deleteItemRule({ item_rule_id: stake.item_rule_id })
        //给要创建的事项规则分配id
        for (let i = 0; i < itemRules.length; i++) {
            //检查是否有重复的事项规则，重复的就不创建
            if (itemRules[i].rule_id && itemRules[i].region_id) {
                var r = await itemService.getItemRules({
                    rule_id: itemRules[i].rule_id,
                    region_id: itemRules[i].region_id,
                    return_stake: false
                })
                if (r.length > 0) {
                    haveSameItemRules = haveSameItemRules + 1
                    continue
                }
            }
            //分配id
            itemRules[i].item_rule_id = maxRuleId.toString()
            maxRuleId = maxRuleId + 1
        }
        var arr = []
        for (let i = 0; i < itemRules.length; i++) {
            arr.push({
                create_time: Date.now(),
                item_rule_id: itemRules[i].item_rule_id,
                rule_id: itemRules[i].rule_id ? itemRules[i].rule_id : '',
                region_id: itemRules[i].region_id ? itemRules[i].region_id : ''
            })
        }
        await itemService.createItemRules(arr)
        createSuccess = true
        //重新创建一个桩
        await itemService.createItemRule({
            create_time: Date.now(),
            item_rule_id: maxRuleId.toString(),
            rule_id: 'null',
            region_id: 'null'
        })
        return new SuccessModel({ msg: '创建事项规则成功' })
    } catch (err) {
        if (createSuccess === true) {
            //创建成功了，只是最后创建桩失败，不用管
            return new SuccessModel({ msg: '创建事项规则成功' })
        }
        return new ErrorModel({ msg: '创建事项规则失败', data: err.message })
    }
}

async function createItemRuleStake() {
    try {
        //先删除全部的桩
        var stakes = await itemService.getItemRules({ rule_id: 'null', region_id: 'null', return_stake: true })
        if (stakes.length > 0) {
            for (let i = 0; i < stakes.length; i++) {
                await itemService.deleteItemRule({ item_rule_id: stakes[i].item_rule_id })
            }
        }
        //找到目前最大的id
        var maxRuleId = 0
        var itemRules = await itemService.getItemRules({ return_stake: false })
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
 * @param {Array} itemRules 待删除的事项规则
 * @returns 
 */
async function deleteItemRules({
    itemRules = null
}) {
    var deletedItemRules = []   //记录已删除的事项规则
    var updatedItems = []   //记录已更新的事项
    try {
        if (itemRules === null) {
            throw new Error('请求体中需要一个itemRules属性，且该属性是一个数组')
        }
        if (itemRules.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        var res = new Array()
        for (let i = 0; i < itemRules.length; i++) {
            //检查item_rule_id的合法性
            let rule = await itemService.getItemRules({ item_rule_id: itemRules[i], return_stake: true })
            if (rule.length <= 0) {
                throw new Error('item_rule_id不存在: ' + itemRules[i])
            }
            else {
                if (rule[0].rule_id === 'null' || rule[0].region_id === 'null') {
                    throw new Error('item_rule_id违法: ' + itemRules[i])
                }
            }
            //根据传入的item_rule_id删除事项规则
            await itemService.deleteItemRule({ item_rule_id: itemRules[i] })
            //记录事项规则删除之前的状态
            deletedItemRules.push(rule[0])
            //把相关的item的item_rule_id设为空字符串，并返回所有受影响的item
            let items = await itemService.getItems({ item_rule_id: itemRules[i] })
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
    } catch (err) {
        //回退所有操作
        try {
            for (let i = 0; i < deletedItemRules.length; i++) {

            }
            for (let i = 0; i < updatedItems.length; i++) {

            }
        } catch (error) {
            return new ErrorModel({ msg: '删除事项规则失败，且回退操作失败，寄！', data: error.message })
        }
        return new ErrorModel({ msg: '删除事项规则失败', data: err.message })
    }
}

/**
 * 更新事项规则
 * @param {Array} itemRules 待更新的事项规则 
 * @returns 
 */
async function updateItemRules({
    itemRules = null
}) {
    var updated = []    //用于记录已更新的事项规则
    try {
        if (itemRules === null) {
            throw new Error('请求体中需要一个itemRules属性，且该属性是一个数组')
        }
        if (itemRules.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        for (let i = 0; i < itemRules.length; i++) {
            //检查item_rule_id的合法性
            let itemrule = await itemService.getItemRules({ item_rule_id: itemRules[i].item_rule_id })
            if (itemrule.length <= 0) {
                throw new Error('item_rule_id不存在: ' + itemRules[i].item_rule_id)
            }
            else {
                if (itemrule[0].rule_id === 'null' && itemrule[0].region_id === 'null') {
                    throw new Error('item_rule_id违法: ' + itemRules[i].item_rule_id)
                }
            }
            //更新事项规则
            await itemService.updateItemRule({
                item_rule_id: itemRules[i].item_rule_id,
                rule_id: itemRules[i].rule_id,
                region_id: itemRules[i].region_id
            })
            //记录已更新的事项规则
            updated.push(itemrule[0])
        }
        return new SuccessModel({ msg: '更新事项规则成功' })
    } catch (err) {
        //操作回滚
        if (updated.length > 0) {

        }
        return new ErrorModel({ msg: '更新事项规则失败', data: err.message })
    }
}

/**
 * 通过rule_id获取对应的规则路径
 * @param {Array} ruleIds 规则id数组
 * @returns 
 */
async function getRulePath({
    ruleIds = null
}) {
    try {
        if (ruleIds === null) {
            throw new Error('请求体中需要一个ruleIds属性，且该属性是一个数组')
        }
        if (ruleIds.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        var res = {}
        for (let i = 0; i < ruleIds.length; i++) {
            let rulePath = await itemService.getRulePath({ rule_id: ruleIds[i] })
            res[ruleIds[i]] = rulePath
        }
        return new SuccessModel({ msg: '获取规则路径成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '获取规则路径失败', data: err.message })
    }
}

/**
 * 通过item_rule_id获取对应的规则路径
 * @param {Array} itemRuleIds 事项规则id数组
 * @returns 
 */
async function getItemRulePath({
    itemRuleIds = null
}) {
    try {
        if (itemRuleIds === null) {
            throw new Error('请求体中需要一个itemRuleIds属性，且该属性是一个数组')
        }
        if (itemRuleIds.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        var res = {}
        for (let i = 0; i < itemRuleIds.length; i++) {
            let itemRule = await itemService.getItemRules({ item_rule_id: itemRuleIds[i] })
            if (itemRule.length <= 0) {
                throw new Error('item_rule_id不存在: ' + itemRuleIds[i])
            }
            else {
                if (itemRule[0].rule_id === 'null' && itemRule[0].region_id === 'null') {
                    throw new Error('item_rule_id违法: ' + itemRuleIds[i])
                }
                let rulePath = await itemService.getRulePath({ rule_id: itemRule[0].rule_id })
                res[itemRuleIds[i]] = rulePath
            }
        }
        return new SuccessModel({ msg: '获取事项规则路径成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '获取事项规则路径失败', data: err.message })
    }
}

/**
 * 获取规则
 * @param {String} rule_id 规则id
 * @param {String} rule_name 规则名称
 * @param {String} parentId 父规则id
 * @returns 
 */
async function getRules({
    rule_id = null,
    rule_name = null,
    parentId = null
}) {
    try {
        var res = await itemService.getRules({
            rule_id: rule_id,
            rule_name: rule_name,
            parentId: parentId,
            return_stake: false
        })
        return new SuccessModel({ msg: '获取规则成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '获取规则失败', data: err.message })
    }
}

/**
 * 获取事项指南
 * @param {String} task_code 事项指南实施编码
 * @returns 
 */
async function getItemGuide({
    task_code = null
}) {
    try {
        if (task_code === null) {
            throw new Error('需要task_code字段')
        }
        var res = await itemService.getTask({ task_code: task_code })
        return new SuccessModel({ msg: '查询成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 获取区划路径
 * @param {Array} regionIds 区划id
 * @returns 
 */
async function getRegionPath({
    regionIds = null
}) {
    try {
        if (regionIds === null) {
            throw new Error('请求体中需要一个regionIds属性，且该属性是一个数组')
        }
        if (regionIds.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        var res = {}
        for (let i = 0; i < regionIds.length; i++) {
            let regionPath = await itemService.getRegionPath({ region_id: regionIds[i] })
            res[regionIds[i]] = regionPath
        }
        return new SuccessModel({ msg: '获取区划路径成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '获取区划路径失败', data: err.message })
    }
}

/**
 * 获取区划
 * @param {String} region_id 区划id
 * @param {String} region_name 区划名称
 * @param {Number} region_level 区划等级
 * @param {String} parentId 上级区划id
 * @returns 
 */
async function getRegions({
    region_id = null,
    region_name = null,
    region_level = null,
    parentId = null
}) {
    try {
        var regions = await itemService.getRegion({
            region_id: region_id,
            region_name: region_name,
            region_level: region_level,
            parentId: parentId
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