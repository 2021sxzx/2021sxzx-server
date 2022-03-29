const { ErrorModel, SuccessModel } = require('../utils/resultModel')
const modelItem = require('../model/item')
const modelRule = require('../model/rule')
const modelRegion = require('../model/region')
const modelTask = require('../model/task')
const modelUserRank = require('../model/userRank')
const modelUsers = require('../model/users')
const itemStatus = require('../config/itemStatus')

/**
 * 获取事项状态表
 * @returns 
 */
async function getItemStatusScheme() {
    return new SuccessModel({ msg: '获取成功', data: itemStatus })
}

/**
 * 获取用户身份表
 * @returns 
 */
async function getUserRankSchema() {
    try {
        var ranks = await modelUserRank.find({}, { _id: 0, __v: 0 })
        var result = {}
        for (let i = 0; i < ranks.length; i++) {
            result[ranks[i].eng_name] = ranks[i]
        }
        return new SuccessModel({ msg: '获取成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '获取失败', data: err.message })
    }
}

/**
 * 获取规则树
 * @returns
 */
async function getRuleTree() {
    try {
        var rules = await modelRule.find({ rule_name: { $ne: 'null' } }, { __v: 0 })
        var res = {}
        for (let i = 0; i < rules.length; i++) {
            res[rules[i].rule_id] = rules[i]
        }
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
        var regions = await modelRegion.find({}, { __v: 0 })
        var res = {}
        for (let i = 0; i < regions.length; i++) {
            res[regions[i]['_id']] = regions[i]
        }
        return new SuccessModel({ msg: '获取区划树成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '获取区划树失败', data: err.message })
    }
}

/**
 * 获取事项
 * @param {Number} create_start_time 事项创建时间的起始时间
 * @param {Number} create_end_time 事项创建时间的终止时间
 * @param {Number} release_start_time 事项发布时间的起始时间
 * @param {Number} release_end_time 事项发布时间的终止时间
 * @param {String} item_name 事项名称
 * @param {Array<String>} task_code 事项指南实施编码
 * @param {Array<Number>} item_status 事项状态
 * @param {Array<String>} item_rule_id 事项规则id
 * @param {Array<String>} rule_id 规则id
 * @param {Array<String>} region_code 区划编码
 * @param {Number} page_size 页大小
 * @param {Number} page_num 页码
 * @returns
 */
async function getItems({
    create_start_time = null,
    create_end_time = null,
    release_start_time = null,
    release_end_time = null,
    item_name = null,
    task_code = null,
    item_status = null,
    rule_id = null,
    region_code = null,
    page_size = null,
    page_num = null
}) {
    try {
        var query = {}
        if (item_name !== null) query.item_name = { $regex: item_name }
        if (task_code !== null) query.task_code = { $in: task_code }
        else query.task_code = { $ne: 'null' }
        if (item_status !== null) query.item_status = { $in: item_status }
        if (rule_id !== null) query.rule_id = { $in: rule_id }
        else query.rule_id = { $ne: 'null' }
        if (region_code !== null) query.region_code = { $in: region_code }
        else query.region_code = { $ne: 'null' }
        create_start_time = (create_start_time !== null) ? create_start_time : 0
        create_end_time = (create_end_time !== null) ? create_end_time : 9999999999999
        query.create_time = { $gte: create_start_time, $lte: create_end_time }
        release_start_time = (release_start_time !== null) ? release_start_time : 0
        release_end_time = (release_end_time !== null) ? release_end_time : 9999999999999
        query.release_time = { $gte: release_start_time, $lte: release_end_time }
        if (page_size !== null && page_num !== null) {
            //只返回部分查询结果
            var dict = {}
            dict.data = await modelItem.find(query, { __v: 0 }).skip(page_num * page_size).limit(page_size)
            dict.total = await modelItem.find(query).count()
            dict.page_size = page_size
            dict.page_num = page_num
            return new SuccessModel({ msg: '查询成功', data: dict })
        }
        var res = await modelItem.find(query, { __v: 0 })
        return new SuccessModel({ msg: '查询成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 创建规则
 * @param {Array<Object>} rules 待创建的规则
 * @returns
 */
async function createRules({
    rules = null
}) {
    try {
        if (rules === null) {
            throw new Error('请求体中需要一个rules属性，且该属性是一个数组')
        }
        if (rules.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        //检查桩
        var stakes = await modelRule.find({ rule_name: 'null' }, { _id: 0, __v: 0 })
        if (stakes.length !== 1) {
            await createRuleStake()
            stakes = await modelRule.find({ rule_name: 'null' }, { _id: 0, __v: 0 })
        }
        var stake = stakes[0]
        //桩的id就是最大的rule_id，用于后续赋值
        var maxRuleId = parseInt(stake.rule_id)
        //删除桩
        await modelRule.deleteOne({ rule_id: stake.rule_id })
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
        var result = await modelRule.create(arr)
        //返回真实的rule_id和_id
        var res = {}
        for (let i = 0; i < rules.length; i++) {
            for (let j = 0; j < result.length; j++) {
                if (result[j].rule_id === rules[i].rule_id) {
                    res[rules[i].temp_id] = result[j]
                    break
                }
            }
        }
        //创建桩
        try {
            await modelRule.create({
                rule_id: maxRuleId.toString(),
                rule_name: 'null',
                parentId: ''
            })
        } catch (e) {
            return new SuccessModel({ msg: '创建规则成功', data: res })
        }
        //返回结果
        return new SuccessModel({ msg: '创建规则成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '创建规则失败', data: err.message })
    }
}

/**
 * 创建rule表里面的桩（非外部接口）
 */
async function createRuleStake() {
    try {
        //先把全部桩删掉
        await modelRule.deleteMany({ rule_name: 'null' })
        //找出最大id并创建一个新的桩
        var maxRuleId = 0
        var rules = await modelRule.find({ rule_name: { $ne: 'null' } }, { _id: 0, __v: 0 })
        for (let i = 0; i < rules.length; i++) {
            let ruleId = parseInt(rules[i].rule_id)
            if (maxRuleId < ruleId) {
                maxRuleId = ruleId
            }
        }
        maxRuleId = maxRuleId + 1
        await modelRule.create({
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
 * @param {Array<String>} rules 待删除的规则
 * @returns
 */
async function deleteRules({
    rules = null
}) {
    try {
        if (rules === null) {
            throw new Error('请求体中需要一个rules属性，且该属性是一个数组')
        }
        if (rules.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        // var needDelete = [] //需要删除的规则树节点的规则id
        for (let i = 0; i < rules.length; i++) {
            //判断rule_id的合法性
            let rule = await modelRule.findOne({ rule_id: rules[i] }, { _id: 0, __v: 0 })
            if (rule === null || rule.rule_name === 'null') {
                throw new Error('rule_id错误: ' + rules[i])
            }
            // var node = rule  //规则树节点
            // while (true) {
            //     needDelete.push(node.rule_id)
            //     let brothers = await modelRule.find({ parentId: node.parentId }, { _id: 0, __v: 0 })
            //     if (brothers.length > 1) break    //父节点有其他子节点，不需要删除
            //     let parent = await modelRule.findOne({ rule_id: node.parentId }, { _id: 0, __v: 0 })
            //     node = parent
            // }
        }
        //批量删除
        // await modelRule.deleteMany({ rule_id: { $in: needDelete } })
        await modelRule.deleteMany({ rule_id: { $in: rules } })
        return new SuccessModel({ msg: '删除规则成功' })
    } catch (err) {
        return new ErrorModel({ msg: '删除规则失败', data: err.message })
    }
}

/**
 * 更新规则
 * @param {Array<Object>} rules 待更新的规则（不更新的字段传null）
 * @returns
 */
async function updateRules({
    rules = null
}) {
    var modifiedCount = 0
    try {
        if (rules === null) {
            throw new Error('请求体中需要一个rules属性，且该属性是一个数组')
        }
        if (rules.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        for (let i = 0; i < rules.length; i++) {
            //解构，没有传的字段默认null
            let {
                rule_id = null,
                rule_name = null,
                parentId = null
            } = rules[i]
            if (rule_id === null) {
                throw new Error('更新规则的时候需要传rule_id')
            }
            //判断rule_id的合法性
            let rule = await modelRule.findOne({ rule_id: rule_id }, { _id: 0, __v: 0 })
            if (rule === null || rule.rule_name === 'null') {
                throw new Error('rule_id错误: ' + rule_id)
            }
            //更新rule
            let newData = {}
            if (rule_name !== null) newData.rule_name = rule_name
            if (parentId !== null) newData.parentId = parentId
            await modelRule.updateOne({ rule_id: rule_id }, newData)
            modifiedCount += 1
        }
        return new SuccessModel({ msg: '更新规则成功', data: modifiedCount })
    } catch (err) {
        return new ErrorModel({ msg: '更新规则失败', data: err.message })
    }
}

/**
 * 通过rule_id获取对应的规则路径
 * @param {Array<String>} rule_id 规则id数组
 * @returns
 */
async function getRulePaths({
    rule_id = null
}) {
    try {
        if (rule_id === null) {
            throw new Error('请求体中需要一个ruleIds属性，且该属性是一个数组')
        }
        if (rule_id.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        //读一次数据库，建立dict，key是rule_id，value是规则树节点
        var rules = await modelRule.find({ rule_name: { $ne: 'null' } }, { _id: 0, __v: 0 })
        var dic = {}
        rules.forEach(function (value) { dic[value.rule_id] = value })
        //计算路径
        var res = {}
        for (let i = 0; i < rule_id.length; i++) {
            let rulePath = []
            let node = dic[rule_id[i]] ? dic[rule_id[i]] : null
            while (node !== null) {
                rulePath.unshift(node)
                node = dic[node.parentId] ? dic[node.parentId] : null
            }
            res[rule_id[i]] = rulePath
        }
        return new SuccessModel({ msg: '获取规则路径成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '获取规则路径失败', data: err.message })
    }
}

/**
 * 获取事项指南
 * @param {String} task_code 事项指南编码
 * @returns
 */
async function getItemGuide({
    task_code = null
}) {
    try {
        if (task_code === null) {
            throw new Error('需要task_code字段')
        }
        var res = await modelTask.findOne({ task_code: task_code }, { _id: 0, __v: 0 })
        return new SuccessModel({ msg: '查询成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 获取区划路径
 * @param {Array<String>} region_code 区划编码
 * @returns
 */
async function getRegionPaths({
    region_code = null
}) {
    try {
        if (region_code === null) {
            throw new Error('请求体中需要一个regionIds属性，且该属性是一个数组')
        }
        if (region_code.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        //读取一次数据库，建立dict，key是region_id，value是区划树节点
        var regions = await modelRegion.find({}, { __v: 0 })
        var dicCode = {}
        var dicId = {}
        regions.forEach(function (value) {
            dicCode[value.region_code] = value
            dicId[value['_id']] = value
        })
        //计算路径
        var res = {}
        for (let i = 0; i < region_code.length; i++) {
            let regionPath = []
            let node = dicCode[region_code[i]] ? dicCode[region_code[i]] : null
            while (node !== null) {
                regionPath.unshift(node)
                node = dicId[node.parentId] ? dicId[node.parentId] : null
            }
            res[region_code[i]] = regionPath
        }
        return new SuccessModel({ msg: '获取区划路径成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '获取区划路径失败', data: err.message })
    }
}

/**
 * 获取区划
 * @param {Array<String>} region_code 区划编码
 * @param {String} region_name 区划名称，用于模糊查询
 * @param {Array<Number>} region_level 区划等级
 * @param {Array<String>} parentId 上级区划id
 * @param {Array<String>} parentCode 上级区划编码（如果和parentId一起传的话就优先使用这个）
 * @param {Number} page_size 页大小
 * @param {Number} page_num 页码
 * @returns
 */
async function getRegions({
    region_code = null,
    region_name = null,
    region_level = null,
    parentId = null,
    parentCode = null,
    page_size = null,
    page_num = null
}) {
    try {
        var query = {}
        if (region_code !== null) query.region_code = { $in: region_code }
        if (region_name !== null) query.region_name = { $regex: region_name }
        if (region_level !== null) query.region_level = { $in: region_level }
        if (parentId !== null) query.parentId = { $in: parentId }
        if (parentCode !== null) {
            let codes = await modelRegion.find({ region_code: { $in: parentCode } }, { __v: 0 })
            let parentid = []
            codes.forEach(function (value) { parentid.push(value['_id']) })
            query.parentId = { $in: parentid }
        }
        if (page_size !== null && page_num !== null) {
            //只返回部分查询结果
            var dict = {}
            dict.data = await modelRegion.find(query, { __v: 0 }).skip(page_num * page_size).limit(page_size)
            dict.total = await modelRegion.find(query).count()
            dict.page_size = page_size
            dict.page_num = page_num
            return new SuccessModel({ msg: '查询成功', data: dict })
        }
        var regions = await modelRegion.find(query, { __v: 0 })
        return new SuccessModel({ msg: '查询成功', data: regions })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 创建事项
 * @param {Array<Object>} items 待创建的事项（传三个字段，事项指南编码、规则id和区划编码）
 * @returns
 */
async function createItems({
    items = null
}) {
    try {
        if (items === null) {
            throw new Error('至少需要items属性，且该属性是一个数组')
        }
        if (!items.length || items.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        //遍历数组创建事项
        var newData = []
        for (let i = 0; i < items.length; i++) {
            //解构，没有传的字段默认是null
            let {
                task_code = null,
                rule_id = null,
                region_code = null
            } = items[i]
            if (task_code === null || rule_id === null || region_code === null) {
                throw new Error('task_code、rule_id和region_code必须同时存在')
            }
            let task = await modelTask.findOne({ task_code: task_code }, { _id: 0, __v: 0 })
            if (task === null) {
                throw new Error('task_code不存在: ' + task_code)
            }
            newData.push({
                item_name: task.task_name,
                task_code: task_code,
                rule_id: rule_id,
                region_code: region_code
            })
            maxValue = maxValue + 1
        }
        //批量创建
        var result = await modelItem.create(newData)
        //返回结果
        return new SuccessModel({ msg: '创建事项成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '创建事项失败', data: err.message })
    }
}

/**
 * 删除事项
 * @param {Array<String>} items 待删除的事项
 * @returns
 */
async function deleteItems({
    items = null
}) {
    try {
        if (items === null) {
            throw new Error('需要items字段，且该字段是一个数组')
        }
        if (!items.length || items.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        for (let i = 0; i < items.length; i++) {
            //判断item_id的合法性
            let item = await modelItem.findOne({ _id: items[i] }, { __v: 0 })
            if (item === null || item.task_code === 'null' || item.rule_id === 'null' || item.region_code === 'null') {
                throw new Error('_id错误: ' + items[i])
            }
        }
        //批量删除
        await modelRule.deleteMany({ _id: { $in: items } })
        return new SuccessModel({ msg: '删除成功' })
    } catch (err) {
        return new ErrorModel({ msg: '删除失败', data: err.message })
    }
}

/**
 * 更新事项
 * @param {Array<Object} items 待更新的事项
 * @returns
 */
async function updateItems({
    items = null
}) {
    try {
        if (items === null) {
            throw new Error('请求体中需要一个items属性，且该属性是一个数组')
        }
        if (items.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        var bulkOps = []
        for (let i = 0; i < items.length; i++) {
            let {
                _id = null,
                task_code = null,
                rule_id = null,
                region_code = null
            } = items[i]
            if (_id === null) {
                throw new Error('更新事项信息需要传_id')
            }
            //判断_id的合法性
            let item = await modelItem.findOne({ _id: _id }, { __v: 0 })
            if (item === null || item.task_code === 'null' || item.rule_id === 'null' || item.region_code === 'null') {
                throw new Error('_id错误: ' + _id)
            }
            //更新item（差量）
            var newData = {}
            if (task_code !== null) newData.task_code = task_code
            if (rule_id !== null) newData.rule_id = rule_id
            if (region_code !== null) newData.region_code = region_code
            bulkOps.push({
                updateOne: {
                    filter: { _id: _id },
                    update: newData
                }
            })
        }
        //批量更新
        var result = await modelItem.bulkWrite(bulkOps)
        return new SuccessModel({ msg: '更新成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '更新失败', data: err.message })
    }
}

/**
 * 根据规则id和区划id获取下级区划，存在事项的区划，其haveItem是1，没有则是0
 * @param {String} rule_id 规则id
 * @param {String} region_code 区划id
 * @returns
 */
async function getChildRegionsByRuleAndRegion({
    rule_id = null,
    region_code = null
}) {
    try {
        if (rule_id === null || region_code === null) {
            throw new Error('rule_id和region_code不能为空')
        }
        //把传入的region_code转成_id
        var region = await modelRegion.findOne({ region_code: region_code }, { __v: 0 })
        if (region === null) {
            throw new Error('region_code不存在: ' + region_code)
        }
        //保存结果
        var result = []
        //先判断该区划本身是否有匹配的事项
        var res = await modelItem.find({
            rule_id: rule_id,
            region_code: region_code
        }, { _id: 0, __v: 0 })
        //有事项haveItem是1，否则是0
        region._doc.haveItem = 0
        if (res.length > 0) {
            region._doc.haveItem = 1
        }
        result.push(region._doc)
        //找出该区划的下级区划
        var childRegions = await modelRegion.find({ parentId: region['_id'] }, { __v: 0 })
        for (let i = 0; i < childRegions.length; i++) {
            var value = childRegions[i]
            //遍历区划，检查该区划包括其全部下级区划在内是否存在rule_id对应的事项
            var regionCodes = []
            var q = []
            q.push(value['_id'])
            regionCodes.push(value.region_code)
            while (q.length > 0) {
                let children = await modelRegion.find({ parentId: { $in: q } }, { __v: 0 })
                q = []
                for (let j = 0; j < children.length; j++) {
                    q.push(children[j]['_id'])
                    regionCodes.push(children[j].region_code)
                }
            }
            //找出匹配的事项
            var res = await modelItem.find({
                rule_id: rule_id,
                region_code: { $in: regionCodes }
            }, { _id: 0, __v: 0 })
            //子区划中有事项的haveItem是1，否则是0
            value._doc.haveItem = 0
            if (res.length > 0) {
                value._doc.haveItem = 1
            }
            result.push(value._doc)
        }
        return new SuccessModel({ msg: '查询成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 获取规则
 * @param {Array<String>} rule_id 规则id
 * @param {String} rule_name 规则名称，用于模糊查询
 * @param {Array<String>} parentId 父规则id
 * @param {Number} start_time 规则创建时间的起始时间
 * @param {Number} end_time 规则创建时间的终止时间
 * @returns
 */
async function getRules({
    rule_id = null,
    rule_name = null,
    parentId = null,
    start_time = null,
    end_time = null
}) {
    try {
        //rule_id用于准确查询
        if (rule_id !== null) {
            var res = await modelRule.find({
                rule_id: { $in: rule_id },
                rule_name: { $ne: 'null' }
            }, { __v: 0 })
            return new SuccessModel({ msg: '查询成功', data: res })
        }
        //rule_name用于模糊查询
        if (rule_name !== null) {
            let start = (start_time !== null) ? start_time : 0
            let end = (end_time !== null) ? end_time : 9999999999999
            var res = await modelRule.find({
                rule_name: { $regex: rule_name },
                create_time: { $gte: start, $lte: end }
            }, { __v: 0 })
            return new SuccessModel({ msg: '查询成功', data: res })
        }
        //parentId用于查找子规则
        if (parentId !== null) {
            let start = (start_time !== null) ? start_time : 0
            let end = (end_time !== null) ? end_time : 9999999999999
            var res = await modelRule.find({
                parentId: { $in: parentId },
                create_time: { $gte: start, $lte: end }
            }, { __v: 0 })
            return new SuccessModel({ msg: '查询成功', data: res })
        }
        //只根据创建时间查询，或者全量查询
        var start = (start_time !== null) ? start_time : 0
        var end = (end_time !== null) ? end_time : 9999999999999
        var res = await modelRule.find({
            rule_name: { $ne: 'null' },
            create_time: { $gte: start, $lte: end }
        }, { __v: 0 })
        return new SuccessModel({ msg: '查询成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 创建区划
 * @param {String} region_code 区划编码
 * @param {String} region_name 区划名称
 * @param {String} region_level 区划等级
 * @param {String} parentCode 上级区划的区划编码（必须是已有的区划）
 * @returns
 */
async function createRegion({
    region_code = null,
    region_name = null,
    region_level = null,
    parentId = null
}) {
    try {
        if (region_code === null || region_name === null || region_level === null || parentId === null) {
            throw new Error('创建区划的时候必须包括全部字段的信息，包括region_code、region_name、region_level和parentCode')
        }
        //创建区划
        var parent = await modelRegion.findOne({ _id: parentId }, { __v: 0 })
        if (parent === null) {
            throw new Error('parentId不存在: ' + parentId)
        }
        if (parent.region_level + 1 !== region_level) {
            throw new Error('region_level错误，上级区划的region_level是' + parent.region_level)
        }
        var result = await modelRegion.create({
            region_code: region_code,
            region_name: region_name,
            region_level: region_level,
            parentId: parentId
        })
        return new SuccessModel({ msg: '创建成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '创建失败', data: err.message })
    }
}

/**
 * 删除区划
 * @param {Array<String>} regions 待删除的区划（用_id删除）
 * @returns
 */
async function deleteRegions({
    regions = null
}) {
    try {
        if (regions === null) {
            throw new Error('请求体中需要一个regions属性，且该属性是一个数组')
        }
        if (regions.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        //判断region_code的合法性
        for (let i = 0; i < regions.length; i++) {
            var rs = await modelRegion.findOne({ _id: regions[i] }, { __v: 0 })
            if (rs === null) {
                throw new Error('region_code不存在: ' + regions[i])
            }
        }
        await modelRegion.deleteMany({ _id: { $in: regions } })
        return new SuccessModel({ msg: '删除成功' })
    } catch (err) {
        return new ErrorModel({ msg: '删除失败', data: err.message })
    }
}

/**
 * 更新区划
 * @param {Array<Object>} regions 待更新的区划（不更新的字段传null，记得传_id）
 * @returns
 */
async function updateRegions({
    regions = null
}) {
    var modifiedCount = 0
    try {
        if (regions === null) {
            throw new Error('请求体中需要一个regions属性，且该属性是一个数组')
        }
        if (regions.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        for (let i = 0; i < regions.length; i++) {
            //解构，没有的字段默认是null
            let {
                _id = null,
                region_code = null,
                region_name = null,
                region_level = null,
                parentId = null
            } = regions[i]
            if (_id === null) {
                throw new Error('更新区划信息需要传入对应_id')
            }
            //判断_id的合法性
            let region = await modelRegion.findOne({ _id: _id }, { __v: 0 })
            if (region === null) {
                throw new Error('_id不存在: ' + _id)
            }
            //更新region（差量）
            let newData = {}
            if (region_code !== null) newData.region_code = region_code
            if (region_name !== null) newData.region_name = region_name
            if (region_level !== null) newData.region_level = region_level
            if (parentId !== null) newData.parentId = parentId
            await modelRegion.updateOne({ _id: _id }, newData)
            modifiedCount += 1
        }
        return new SuccessModel({ msg: '更新成功', data: modifiedCount })
    } catch (err) {
        return new ErrorModel({ msg: '更新失败', data: err.message })
    }
}

/**
 * 改变事项的状态
 * @param {Array<Object>} items 待改变状态的事项（数组成员包含item_id和next_status属性）
 * @returns 
 */
async function changeItemStatus({
    user_id = null,
    items = null
}) {
    try {
        if (user_id === null || items === null) {
            throw new Error('调用changeItemStatus必须有user_id和items字段')
        }
        if (!items.length || items.length <= 0) {
            throw new Error('不是数组或数组长度小于等于0')
        }
        //确认用户身份
        var user = await modelUsers.findOne({ _id: user_id }, { __v: 0 })
        if (user === null) {
            throw new Error('用户不存在')
        }
        var userRank = await modelUserRank.findOne({ id: user.user_rank }, { _id: 0, __v: 0 })
        //确认用户可操作事项状态
        var can_operate = userRank.can_operate
        if (userRank.can_operate_temp[user_id]) {
            //针对某个用户修改过权限
            can_operate = userRank.can_operate_temp[user_id]
        }
        var bulkOps = []
        for (let i = 0, len = items.length; i < len; i++) {
            //解构，默认null
            var { item_id = null, next_status = null } = items[i]
            if (item_id === null || next_status === null) {
                throw new Error('调用changeItemStatus必须有item_id和next_status字段')
            }
            //查询事项现在的状态
            var item = await modelItem.findOne({ item_id: item_id }, { __v: 0 })
            if (item === null) {
                throw new Error('item_id不存在: ' + item_id)
            }
            //判断能否变为next_status
            var keys = Object.keys(itemStatus)
            for (let j = 0; j < keys.length; j++) {
                var status = itemStatus[keys[j]]
                if (status.id !== item.item_status) {
                    if (j === keys.length - 1) throw new Error('itemStatus表和数据库中已有的事项状态对不上')
                    continue
                }
                if (status.next_status.includes(next_status) === false) {
                    throw new Error('事项所处状态无法变到指定状态: ' + item_id)
                }
                if (can_operate.includes(status.id) === false) {
                    throw new Error('该用户无法修改状态为\"' + status.name + '\"的事项')
                }
                //加到数组中，后续一起更新
                bulkOps.push({
                    updateOne: {
                        filter: { item_id: item_id },
                        update: { item_status: next_status }
                    }
                })
            }
        }
        //批量更新
        var result = await modelItem.bulkWrite(bulkOps)
        return new SuccessModel({ msg: '更新成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '更新失败', data: err.message })
    }
}

/**
 * 更新用户身份
 * @param {Array<Object>} user_rank 待更新的用户身份
 * @returns 
 */
async function updateUserRank({
    user_rank = null
}) {
    try {
        if (user_rank === null) {
            throw new Error('调用updateUserRank需要user_rank数组')
        }
        if (!user_rank.length || user_rank.length <= 0) {
            throw new Error('不是数组或数组长度小于等于0')
        }
        //更新用户身份
        var bulkOps = []
        for (let i = 0; i < user_rank.length; i++) {
            var {
                id = null,
                cn_name = null,
                can_see = null,
                can_operate = null
            } = user_rank[i]
            if (id === null) {
                throw new Error('缺少id')
            }
            var newData = {}
            if (cn_name !== null) newData.cn_name = cn_name
            if (can_see !== null) newData.can_see = can_see
            if (can_operate !== null) newData.can_operate = can_operate
            bulkOps.push({
                updateOne: {
                    filter: { id: id },
                    update: newData
                }
            })
        }
        //批量更新
        var result = await modelUserRank.bulkWrite(bulkOps)
        return new SuccessModel({ msg: '更新成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '更新失败', data: err.message })
    }
}

async function changeUserRankTemporary({
    array = null
}) {
    try {
        if (array === null) {
            throw new Error('调用changeUserRankTemporary需要array字段')
        }
        if (!array.length || array.lengt <= 0) {
            throw new Error('不是数组或数组长度小于等于0')
        }
        var userRank = await modelUserRank.find({}, { _id: 0, __v: 0 })
        var needChange = {}
        for (let i = 0; i < array.length; i++) {
            var {
                user_id = null,
                can_see_temp = null,
                can_operate_temp = null
            } = array[i]
            var user = await modelUsers.findOne({ _id: user_id }, { __v: 0 })
            if (user === null) {
                throw new Error('用户不存在')
            }
            for (let j = 0; j < userRank.length; j++) {
                if (userRank[j].id === user.user_rank) {
                    needChange[userRank[j].id] = j
                    if (can_see_temp !== null) userRank[j]._doc.can_see_temp[user_id] = can_see_temp
                    if (can_operate_temp !== null) userRank[j]._doc.can_operate_temp[user_id] = can_operate_temp
                    break
                }
            }
        }
        var bulkOps = []
        var keys = Object.keys(needChange)
        for (let i = 0; i < keys.length; i++) {
            bulkOps.push({
                updateOne: {
                    filter: { id: keys[i] },
                    update: {
                        can_see_temp: userRank[needChange[keys[i]]]._doc.can_see_temp,
                        can_operate_temp: userRank[needChange[keys[i]]]._doc.can_operate_temp
                    }
                }
            })
        }
        var result = await modelUserRank.bulkWrite(bulkOps)
        return new SuccessModel({ msg: '修改成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '修改失败', data: err.message })
    }
}

module.exports = {
    getItemStatusScheme,
    getUserRankSchema,
    getRuleTree,
    getRegionTree,
    getItems,
    createItems,
    deleteItems,
    updateItems,
    changeItemStatus,
    getRules,
    createRules,
    deleteRules,
    updateRules,
    getRulePaths,
    getRegions,
    createRegion,
    deleteRegions,
    updateRegions,
    getRegionPaths,
    getChildRegionsByRuleAndRegion,
    getItemGuide,
}
