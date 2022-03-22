const { ErrorModel, SuccessModel } = require('../utils/resultModel')
const modelItem = require('../model/item')
const modelRule = require('../model/rule')
const modelRegion = require('../model/region')
const modelTask = require('../model/task')

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
            res[regions[i].region_code] = regions[i]
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
 * @param {Array<String>} item_id 事项id
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
    item_id = null,
    task_code = null,
    item_status = null,
    item_rule_id = null,
    rule_id = null,
    region_code = null,
    page_size = null,
    page_num = null
}) {
    try {
        var query = {}
        if (item_id !== null) query.item_id = { $in: item_id }
        if (task_code !== null) query.task_code = { $in: task_code }
        else query.task_code = { $ne: 'null' }
        if (item_status !== null) query.item_status = { $in: item_status }
        if (item_rule_id !== null) query.item_rule_id = { $in: item_rule_id }
        else query.item_rule_id = { $ne: 'null' }
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
        var res = await modelItem.find(query, { __v: 0 })
        if (page_size !== null && page_num !== null) {
            //只返回部分查询结果
            if (page_size < res.length) {
                var r = []
                for (let i = 0; i < page_size; i++) {
                    let index = page_size * page_num + i
                    if (index >= res.length) break
                    r.push(res[index])
                }
                var dict = {}
                dict.data = r
                dict.total = res.length
                dict.page_size = page_size
                dict.page_num = page_num
                return new SuccessModel({ msg: '查询成功', data: dict })
            }
        }
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
    var createSuccess = false
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
        await modelRule.create(arr)
        createSuccess = true
        //创建桩
        await modelRule.create({
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
        var needDelete = [] //需要删除的规则树节点的规则id
        for (let i = 0; i < rules.length; i++) {
            //判断rule_id的合法性
            let rule = await modelRule.findOne({ rule_id: rules[i] }, { _id: 0, __v: 0 })
            if (rule === null || rule.rule_name === 'null') {
                throw new Error('rule_id错误: ' + rules[i])
            }
            var node = rule  //规则树节点
            while (true) {
                needDelete.push(node.rule_id)
                let brothers = await modelRule.find({ parentId: node.parentId }, { _id: 0, __v: 0 })
                if (brothers.length > 1) break    //父节点有其他子节点，不需要删除
                let parent = await modelRule.findOne({ rule_id: node.parentId }, { _id: 0, __v: 0 })
                node = parent
            }
        }
        //批量删除
        await modelRule.deleteMany({ rule_id: { $in: needDelete } })
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
    try {
        if (rules === null) {
            throw new Error('请求体中需要一个rules属性，且该属性是一个数组')
        }
        if (rules.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        for (let i = 0; i < rules.length; i++) {
            //判断rule_id的合法性
            let rule = await modelRule.findOne({ rule_id: rules[i].rule_id }, { _id: 0, __v: 0 })
            if (rule === null || rule.rule_name === 'null') {
                throw new Error('rule_id错误: ' + rules[i].rule_id)
            }
            //更新rule
            if (rules[i].rule_name === null) rules[i].rule_name = rule.rule_name
            if (rules[i].parentId === null) rules[i].parentId = rule.parentId
            await modelRule.updateOne({ rule_id: rules[i].rule_id }, {
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
        var dic = {}
        regions.forEach(function (value) { dic[value.region_code] = value })
        //计算路径
        var res = {}
        for (let i = 0; i < region_code.length; i++) {
            let regionPath = []
            let node = dic[region_code[i]] ? dic[region_code[i]] : null
            while (node !== null) {
                regionPath.unshift(node)
                node = dic[node.parentId] ? dic[node.parentId] : null
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
 * @param {Number} page_size 页大小
 * @param {Number} page_num 页码
 * @returns 
 */
async function getRegions({
    region_code = null,
    region_name = null,
    region_level = null,
    parentId = null,
    page_size = null,
    page_num = null
}) {
    try {
        if (region_code !== null) {
            //region_code查找唯一区划
            var regions = await modelRegion.find({
                region_code: { $in: region_code }
            }, { __v: 0 })
            return new SuccessModel({ msg: '查询成功', data: regions })
        }
        var query = {}
        if (region_name !== null) query.region_name = { $regex: region_name }
        if (region_level !== null) query.region_level = { $in: region_level }
        if (parentId !== null) query.parentId = { $in: parentId }
        var regions = await modelRegion.find(query, { __v: 0 })
        if (page_size !== null && page_num !== null) {
            //只返回部分查询结果
            var r = []
            for (let i = 0; i < page_size; i++) {
                let index = page_size * page_num + i
                if (index >= regions.length) break
                r.push(regions[index])
            }
            var dict = {}
            dict.data = r
            dict.total = regions.length
            dict.page_size = page_size
            dict.page_num = page_num
            return new SuccessModel({ msg: '查询成功', data: dict })
        }
        return new SuccessModel({ msg: '查询成功', data: regions })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 创建事项
 * @param {Array<Object>} items 待创建的事项（可以传三个字段，事项指南编码、规则id和区划编码）
 * @returns 
 */
async function createItems({
    items = null
}) {
    var createSuccess = false
    try {
        if (items === null) {
            throw new Error('至少需要items属性，且该属性是一个数组')
        }
        if (items.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        //检查桩
        var stakes = await modelItem.find({
            task_code: 'null',
            rule_id: 'null',
            region_code: 'null'
        }, { _id: 0, __v: 0 })
        if (stakes.length !== 1) {
            await createItemStake()
            stakes = await modelItem.find({
                task_code: 'null',
                rule_id: 'null',
                region_code: 'null'
            }, { _id: 0, __v: 0 })
        }
        //暂时删除桩
        var stake = stakes[0]
        await modelItem.deleteOne({ item_id: stake.item_id })
        var maxValue = parseInt(stake.item_id)
        //遍历数组创建事项
        var newData = []
        for (let i = 0; i < items.length; i++) {
            //解构，没有传的字段默认是null
            let {
                task_code = null,
                rule_id = null,
                region_code = null
            } = items[i]
            newData.push({
                item_id: maxValue.toString(),
                task_code: (task_code !== null) ? task_code : '',
                rule_id: (rule_id !== null) ? rule_id : '',
                region_code: (region_code !== null) ? region_code : ''
            })
            maxValue = maxValue + 1
        }
        //批量创建
        await modelItem.create(newData)
        createSuccess = true
        //创建桩
        await modelItem.create({
            item_id: maxValue.toString(),
            task_code: 'null',
            rule_id: 'null',
            region_code: 'null'
        })
        return new SuccessModel({ msg: '创建事项成功' })
    } catch (err) {
        //只是最后创建桩失败了，不用管
        if (createSuccess === true) {
            return new SuccessModel({ msg: '创建事项成功' })
        }
        return new ErrorModel({ msg: '创建事项失败', data: err.message })
    }
}

/**
 * 创建item表的桩（非外部接口）
 */
async function createItemStake() {
    try {
        //先删除全部桩
        await modelItem.deleteMany({
            task_code: 'null',
            rule_id: 'null',
            region_code: 'null'
        })
        //计算桩的item_id
        var items = await modelItem.find({
            task_code: { $ne: 'null' },
            rule_id: { $ne: 'null' },
            region_code: { $ne: 'null' }
        }, { _id: 0, __v: 0 })
        var maxValue = 0
        for (let i = 0; i < items.length; i++) {
            var num = parseInt(items[i].item_id)
            if (maxValue <= num) {
                maxValue = num
            }
        }
        maxValue = maxValue + 1
        //创建桩
        await modelItem.create({
            item_id: maxValue.toString(),
            task_code: 'null',
            rule_id: 'null',
            region_code: 'null'
        })
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * 删除事项
 * @param {Array<String>} items 待删除的事项（_id）
 * @returns 
 */
async function deleteItems({
    items = null
}) {
    try {
        if (items === null) {
            throw new Error('需要items字段，且该字段是一个数组')
        }
        if (items.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        for (let i = 0; i < items.length; i++) {
            //判断item_id的合法性
            let item = await modelItem.findOne({ _id: items[i] }, { _id: 0, __v: 0 })
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
 * @param {Array<Object} items 待更新的事项（不更新的字段传null，记得传_id）
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
            await modelItem.updateOne({ _id: _id }, newData)
        }
        return new SuccessModel({ msg: '更新成功' })
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
        //找出子区划
        var childRegions = await modelRegion.find({ parentId: region_code }, { _id: 0, __v: 0 })
        var regionCodes = []
        childRegions.forEach(function (value) { regionCodes.push(value.region_code) })
        //找出匹配的事项
        var res = await modelItem.find({
            rule_id: rule_id,
            region_code: { $in: regionCodes }
        }, { _id: 0, __v: 0 })
        //子区划中有事项的haveItem是1，否则是0
        var result = []
        childRegions.forEach(function (value) {
            value._doc.haveItem = 0
            result.push(value._doc)
            res.forEach(function (v) {
                if (v.region_code === value.region_code) {
                    value._doc.haveItem = 1
                }
            })
        })
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
            }, { _id: 0, __v: 0 })
            return new SuccessModel({ msg: '查询成功', data: res })
        }
        //rule_name用于模糊查询
        if (rule_name !== null) {
            let start = (start_time !== null) ? start_time : 0
            let end = (end_time !== null) ? end_time : 9999999999999
            var res = await modelRule.find({
                rule_name: { $regex: rule_name },
                create_time: { $gte: start, $lte: end }
            }, { _id: 0, __v: 0 })
            return new SuccessModel({ msg: '查询成功', data: res })
        }
        //parentId用于查找子规则
        if (parentId !== null) {
            let start = (start_time !== null) ? start_time : 0
            let end = (end_time !== null) ? end_time : 9999999999999
            var res = await modelRule.find({
                parentId: { $in: parentId },
                create_time: { $gte: start, $lte: end }
            }, { _id: 0, __v: 0 })
            return new SuccessModel({ msg: '查询成功', data: res })
        }
        //只根据创建时间查询，或者全量查询
        var start = (start_time !== null) ? start_time : 0
        var end = (end_time !== null) ? end_time : 9999999999999
        var res = await modelRule.find({
            rule_name: { $ne: 'null' },
            create_time: { $gte: start, $lte: end }
        }, { _id: 0, __v: 0 })
        return new SuccessModel({ msg: '查询成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 创建区划
 * @param {Array<Object>} regions 待创建的区划（必须包含全部字段信息）
 * @returns 
 */
async function createRegions({
    regions = null
}) {
    try {
        if (regions === null) {
            throw new Error('请求体中需要一个regions属性，且该属性是一个数组')
        }
        if (regions.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        //创建区划
        var arr = []
        for (let i = 0; i < regions.length; i++) {
            let {
                region_code = null,
                region_name = null,
                region_level = null,
                parentId = null
            } = regions[i]
            if (region_code === null || region_name === null || region_level === null || parentId === null) {
                throw new Error('创建区划的时候必须包括全部字段的信息，包括region_code、region_name、region_level和parentId')
            }
            arr.push({
                region_code: region_code,
                region_name: region_name,
                region_level: region_level,
                parentId: parentId
            })
        }
        await modelRegion.create(arr)
        return new SuccessModel({ msg: '创建成功' })
    } catch (err) {
        return new ErrorModel({ msg: '创建失败', data: err.message })
    }
}

/**
 * 删除区划
 * @param {Array<String>} regions 待删除的区划（用region_code删除）
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
            var rs = await modelRegion.findOne({ region_code: regions[i] }, { __v: 0 })
            if (rs === null) {
                throw new Error('region_code不存在: ' + regions[i])
            }
        }
        await modelRegion.deleteMany({ region_code: { $in: regions } })
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
        }
        return new SuccessModel({ msg: '更新成功' })
    } catch (err) {
        return new ErrorModel({ msg: '更新失败', data: err.message })
    }
}

module.exports = {
    getRuleTree,
    getRegionTree,
    getItems,
    createItems,
    deleteItems,
    updateItems,
    getRules,
    createRules,
    deleteRules,
    updateRules,
    getRulePaths,
    getRegions,
    createRegions,
    deleteRegions,
    updateRegions,
    getRegionPaths,
    getChildRegionsByRuleAndRegion,
    getItemGuide,
}