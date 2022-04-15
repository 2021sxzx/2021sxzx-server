const { ErrorModel, SuccessModel } = require('../utils/resultModel')
const path = require('path')
const fs = require('fs')
const modelItem = require('../model/item')
const modelRule = require('../model/rule')
const modelRegion = require('../model/region')
const modelTask = require('../model/task')
const modelTempTask = require('../model/tempTasks')
const modelUserRank = require('../model/userRank')
const modelUsers = require('../model/users')
const modelItemStatus = require('../model/itemStatus')
const modelDepartmentMapUsers = require('../model/departmentMapUser')
const itemService = require('../service/itemService')

/**
 * 获取事项状态表
 * @returns 
 */
async function getItemStatusScheme() {
    try {
        var status = await modelItemStatus.find({}, { _id: 0, __v: 0 })
        var result = {}
        for (let i = 0; i < status.length; i++) {
            result[status[i].id] = status[i]
        }
        return new SuccessModel({ msg: '获取成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '获取失败', data: err.message })
    }
}

/**
 * 获取用户身份
 * @returns 
 */
async function getUserRank({
    user_id = null
}) {
    try {
        var user = await modelUsers.findOne({ _id: user_id }, { user_rank: 1 })
        var rank = await modelUserRank.findOne({ id: user.user_rank }, { _id: 0, __v: 0 })
        var result = {}
        var can_see = rank.can_see
        var can_operate = rank.can_operate
        //检查can_see_temp
        if (rank.can_see_temp[user_id]) {
            can_see = rank.can_see_temp[user_id]
        }
        //检查can_operate_temp
        if (rank.can_operate_temp[user_id]) {
            can_operate = rank.can_operate_temp[user_id]
        }
        result.eng_name = rank.eng_name
        result.cn_name = rank.cn_name
        result.can_see = can_see
        result.can_operate = can_operate
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
        var rules = await modelRule.find({ rule_name: { $ne: 'null' } }, { __v: 0, children: 0 })
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
        var regions = await modelRegion.find({}, { __v: 0, children: 0 })
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
 * @param {Array<String>} rule_id 规则id
 * @param {Array<String>} region_code 区划编码
 * @param {Array<String>} region_id 区划id
 * @param {String} creator_name 创建人名字
 * @param {String} department_name 部门名称
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
    region_id = null,
    creator_name = null,
    department_name = null,
    page_size = null,
    page_num = null
}) {
    try {
        var query = {}
        if (item_name !== null) query.item_name = { $regex: item_name }
        if (task_code !== null) query.task_code = { $in: task_code }
        if (item_status !== null) query.item_status = { $in: item_status }
        if (rule_id !== null) query.rule_id = { $in: rule_id }
        if (region_code !== null) query.region_code = { $in: region_code }
        if (region_id !== null) query.region_id = { $in: region_id }
        if (creator_name !== null) query['creator.name'] = { $regex: creator_name }
        if (department_name !== null) query['creator.department_name'] = { $regex: department_name }
        create_start_time = (create_start_time !== null) ? create_start_time : 0
        create_end_time = (create_end_time !== null) ? create_end_time : 9999999999999
        query.create_time = { $gte: create_start_time, $lte: create_end_time }
        release_start_time = (release_start_time !== null) ? release_start_time : 0
        release_end_time = (release_end_time !== null) ? release_end_time : 9999999999999
        query.release_time = { $gte: release_start_time, $lte: release_end_time }
        if (page_size !== null && page_num === null || page_size === null && page_num !== null) {
            throw new Error('page_size和page_num需要一起传')
        }
        if (page_size !== null && page_num !== null) {
            //只返回部分查询结果
            var items = await modelItem.find(query, { __v: 0 }).skip(page_num * page_size).limit(page_size)
            //计算规则路径和区划路径
            var ruleDic = itemService.getRuleDic()
            var regionDic = itemService.getRegionDic()
            if (ruleDic === null || regionDic === null) {
                throw new Error('请刷新重试')
            }
            for (let i = 0; i < items.length; i++) {
                let rulePath = ''
                let node = ruleDic[items[i].rule_id] ? ruleDic[items[i].rule_id] : null
                while (node !== null) {
                    rulePath = node.rule_name + '/' + rulePath
                    node = ruleDic[node.parentId] ? ruleDic[node.parentId] : null
                }
                items[i]._doc.rule_path = rulePath
                let regionPath = ''
                let node1 = regionDic[items[i].region_id] ? regionDic[items[i].region_id] : null
                while (node1 !== null) {
                    regionPath = node1.region_name + '/' + regionPath
                    node1 = regionDic[node1.parentId] ? regionDic[node1.parentId] : null
                }
                items[i]._doc.region_path = regionPath
            }
            //返回结果
            var dict = {}
            dict.data = items
            dict.total = await modelItem.find(query).count()
            dict.page_size = page_size
            dict.page_num = page_num
            return new SuccessModel({ msg: '查询成功', data: dict })
        }
        var items = await modelItem.find(query, { __v: 0 })
        //计算规则路径和区划路径
        var ruleDic = itemService.getRuleDic()
        var regionDic = itemService.getRegionDic()
        if (ruleDic === null || regionDic === null) {
            throw new Error('请刷新重试')
        }
        for (let i = 0; i < items.length; i++) {
            let rulePath = ''
            let node = ruleDic[items[i].rule_id] ? ruleDic[items[i].rule_id] : null
            while (node !== null) {
                rulePath = node.rule_name + '/' + rulePath
                node = ruleDic[node.parentId] ? ruleDic[node.parentId] : null
            }
            items[i]._doc.rule_path = rulePath
            let regionPath = ''
            let node1 = regionDic[items[i].region_id] ? regionDic[items[i].region_id] : null
            while (node1 !== null) {
                regionPath = node1.region_name + '/' + regionPath
                node1 = regionDic[node1.parentId] ? regionDic[node1.parentId] : null
            }
            items[i]._doc.region_path = regionPath
        }
        return new SuccessModel({ msg: '查询成功', data: items })
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
    user_id = null,
    rules = null
}) {
    try {
        if (user_id === null || rules === null) {
            throw new Error('请求体中需要user_id和rules')
        }
        if (rules.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        //检查user_id
        var user = await modelUsers.findOne({ _id: user_id }, { __v: 0 })
        if (user === null) {
            throw new Error('user_id不存在: ' + user_id)
        }
        var department = await modelDepartmentMapUsers.findOne({ account: user.account }, { __v: 0 })
        if (department === null) {
            throw new Error('用户没有所属部门')
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
        var bulkOps = []
        for (let i = 0; i < rules.length; i++) {
            arr.push({
                rule_id: rules[i].rule_id,
                rule_name: rules[i].rule_name,
                parentId: rules[i].parentId,
                creator: {
                    id: user_id,
                    name: user.user_name,
                    department_name: department.department_name
                }
            })
            bulkOps.push({
                // insertOne: {
                //     document: {
                //         rule_id: rules[i].rule_id,
                //         rule_name: rules[i].rule_name,
                //         parentId: rules[i].parentId,
                //         creator: {
                //             id: user_id,
                //             name: user.user_name,
                //             department_name: department.department_name
                //         }
                //     }
                // },
                updateOne: {
                    filter: { rule_id: rules[i].parentId },
                    update: { $push: { children: rules[i].rule_id } }
                }
            })
        }
        var result = await modelRule.create(arr)
        await modelRule.bulkWrite(bulkOps)
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
        //更新内存中的规则树
        var data = []
        for (let i = 0; i < rules.length; i++) {
            data.push(rules[i].rule_id)
        }
        itemService.addUpdateTask('createRules', data)
        //创建桩
        try {
            await modelRule.create({
                rule_id: maxRuleId.toString(),
                rule_name: 'null',
                parentId: '',
                creator: {
                    id: 'null',
                    name: 'null',
                    department_name: 'null'
                }
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
            parentId: '',
            creator: {
                id: 'null',
                name: 'null',
                department_name: 'null'
            }
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
        var bulkOps = []
        for (let i = 0; i < rules.length; i++) {
            //判断rule_id的合法性
            let rule = await modelRule.findOne({ rule_id: rules[i] }, { _id: 0, __v: 0 })
            if (rule === null || rule.rule_name === 'null') {
                throw new Error('rule_id错误: ' + rules[i])
            }
            bulkOps.push({
                updateOne: {
                    filter: { rule_id: rule.parentId },
                    update: { $pull: { children: rule.rule_id } }
                }
            })
        }
        bulkOps.push({
            deleteMany: {
                filter: { rule_id: { $in: rules } }
            }
        })
        //检查是否有事项指南与规则绑定
        var items = await modelItem.find({ rule_id: { $in: rules } }, { __v: 0 }).count()
        if (items > 0) {
            return new SuccessModel({ msg: '删除规则失败，有与其绑定的事项还未处理', data: { code: 999 } })
        }
        //批量删除
        // var result = await modelRule.deleteMany({ rule_id: { $in: rules } })
        var result = await modelRule.bulkWrite(bulkOps)
        //更新内存中的规则树
        itemService.addUpdateTask('deleteRules', rules)
        return new SuccessModel({ msg: '删除规则成功', data: result })
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
        var data = []
        var bulkOps = []
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
            if (parentId !== null) {
                newData.parentId = parentId
                bulkOps.push({
                    updateOne: {
                        filter: { rule_id: rule.parentId },
                        update: { $pull: { children: rule_id } }
                    }
                })
                bulkOps.push({
                    updateOne: {
                        filter: { rule_id: parentId },
                        update: { $push: { children: rule_id } }
                    }
                })
            }
            bulkOps.push({
                updateOne: {
                    filter: { rule_id: rule_id },
                    update: newData
                }
            })
            data.push(rule_id)
        }
        //批量更新
        var result = await modelRule.bulkWrite(bulkOps)
        //更新内存中的规则树
        itemService.addUpdateTask('updateRules', data)
        return new SuccessModel({ msg: '更新规则成功', data: result })
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
        //计算路径
        var ruleDic = itemService.getRuleDic()
        if (ruleDic === null) {
            throw new Error('请刷新重试')
        }
        var res = {}
        for (let i = 0; i < rule_id.length; i++) {
            let rulePath = []
            let node = ruleDic[rule_id[i]] ? ruleDic[rule_id[i]] : null
            while (node !== null) {
                rulePath.unshift(node)
                node = ruleDic[node.parentId] ? ruleDic[node.parentId] : null
            }
            res[rule_id[i]] = rulePath
        }
        return new SuccessModel({ msg: '获取规则路径成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '获取规则路径失败', data: err.message })
    }
}

/**
 * 获取事项指南，返回Object或者null
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
        var res = await modelTempTask.findOne({ task_code: task_code }, { _id: 0, __v: 0 })
        return new SuccessModel({ msg: '查询成功', data: res })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 获取事项指南，只返回task_code、task_name和task_status
 * @param {Number} task_status 事项指南状态（0或者1）
 * @param {String} task_code 事项指南编码
 * @param {String} task_name 事项指南名称（用于模糊匹配）
 * @param {String} creator_name 创建人名字
 * @param {String} department_name 部门名称
 * @param {Number} start_time 创建时间的起始时间
 * @param {Number} end_time 创建时间的终止时间
 * @param {Number} page_size 页大小
 * @param {Number} page_num 页码
 * @returns 
 */
async function getItemGuides({
    task_status = null,
    task_code = null,
    task_name = null,
    creator_name = null,
    department_name = null,
    start_time = null,
    end_time = null,
    page_size = null,
    page_num = null
}) {
    try {
        var query = {}
        if (task_status !== null) query.task_status = task_status
        if (task_code !== null) query.task_code = task_code
        if (task_name !== null) query.task_name = { $regex: task_name }
        if (creator_name !== null) query['creator.name'] = { $regex: creator_name }
        if (department_name !== null) query['creator.department_name'] = { $regex: department_name }
        var start = (start_time !== null) ? start_time : 0
        var end = (end_time !== null) ? end_time : 9999999999999
        query.create_time = { $gte: start, $lte: end }
        if (page_size !== null && page_num === null || page_size === null && page_num !== null) {
            throw new Error('page_size和page_num需要一起传')
        }
        if (page_size !== null && page_num !== null) {
            var result = {}
            result.data = await modelTempTask.find(query, {
                task_status: 1, task_code: 1, task_name: 1, create_time: 1, creator: 1
            }).skip(page_size * page_num).limit(page_size)
            result.total = await modelTempTask.find(query).count()
            result.page_size = page_size
            result.page_num = page_num
            return new SuccessModel({ msg: '查询成功', data: result })
        }
        var result = await modelTempTask.find(query, {
            task_status: 1, task_code: 1, task_name: 1, create_time: 1, creator: 1
        })
        return new SuccessModel({ msg: '查询成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '查询失败', data: err.message })
    }
}

/**
 * 创建事项指南
 * @param {String} task_code 事项指南编码
 * @param {String} task_name 事项指南名称
 * @param {String} wsyy 已开通的网上办理方式
 * @param {Array<Number>} service_object_type 服务对象类型
 * @param {String} conditions 办理条件
 * @param {Array<Object>} legal_basis 法律法规依据
 * @param {Number} legal_period 法定期限
 * @param {String} legal_period_type 法定期限单位
 * @param {Number} promised_period 承诺期限
 * @param {String} promised_period_type 承诺期限单位
 * @param {Array<Object>} windows 办事窗口
 * @param {String} apply_content 申请内容
 * @param {String} ckbllc 窗口办理流程
 * @param {String} wsbllc 网上办理流程
 * @param {String} mobile_applt_website 移动端办理地址
 * @param {Array<Object>} submit_documents 提交材料
 * @param {String} zxpt 咨询平台
 * @param {String} qr_code 二维码
 * @param {String} zzzd 自助终端
 * @returns 
 */
async function createItemGuide({
    user_id = null,
    task_code = null,
    task_name = null,
    wsyy = null,
    service_object_type = null,
    conditions = null,
    legal_basis = null,
    legal_period = null,
    legal_period_type = null,
    promised_period = null,
    promised_period_type = null,
    windows = null,
    apply_content = null,
    ckbllc = null,
    wsbllc = null,
    mobile_applt_website = null,
    submit_documents = null,
    zxpt = null,
    qr_code = null,
    zzzd = null
}) {
    try {
        //检查user_id
        if (user_id === null) {
            throw new Error('需要user_id')
        }
        var user = await modelUsers.findOne({ _id: user_id }, { __v: 0 })
        if (user === null) {
            throw new Error('user_id不存在: ' + user_id)
        }
        var department = await modelDepartmentMapUsers.findOne({ account: user.account }, { __v: 0 })
        if (department === null) {
            throw new Error('用户没有所属部门')
        }
        var newData = {
            task_code: null,
            task_name: null,
            wsyy: null,
            service_object_type: null,
            conditions: null,
            legal_basis: null,
            legal_period: null,
            legal_period_type: null,
            promised_period: null,
            promised_period_type: null,
            windows: null,
            apply_content: null,
            ckbllc: null,
            wsbllc: null,
            mobile_applt_website: null,
            submit_documents: null,
            zxpt: null,
            qr_code: null,
            zzzd: null,
            creator: {
                id: user_id,
                name: user.user_name,
                department_name: department.department_name
            }
        }
        if (task_code !== null) {
            let task = await modelTempTask.exists({ task_code: task_code })
            if (task === true) {
                throw new Error('事项指南编码已存在')
            }
            newData.task_code = task_code
        }
        if (task_name !== null) newData.task_name = task_name
        if (wsyy !== null) newData.wsyy = wsyy
        if (service_object_type !== null) {
            let str = ''
            for (let i = 0; i < service_object_type.length; i++) {
                if (str === '') {
                    str += service_object_type[i].toString()
                } else {
                    str += ',' + service_object_type[i].toString()
                }
            }
            newData.service_object_type = str
        }
        if (conditions !== null) newData.conditions = conditions
        if (legal_basis !== null) newData.legal_basis = legal_basis
        if (legal_period !== null) newData.legal_period = legal_period
        if (legal_period_type !== null) newData.legal_period_type = legal_period_type
        if (promised_period !== null) newData.promised_period = promised_period
        if (promised_period_type !== null) newData.promised_period_type = promised_period_type
        if (windows !== null) newData.windows = windows
        if (apply_content !== null) newData.apply_content = apply_content
        if (ckbllc !== null) newData.ckbllc = ckbllc
        if (wsbllc !== null) newData.wsbllc = wsbllc
        if (mobile_applt_website !== null) newData.mobile_applt_website = mobile_applt_website
        if (submit_documents !== null) newData.submit_documents = submit_documents
        if (zxpt !== null) newData.zxpt = zxpt
        if (qr_code !== null) {
            var filePath = path.join('../public/imgs/itemGuideQRCode', task_code + '.png')
            var base64Data = qr_code.replace(/^data:image\/\w+;base64,/, '')
            var dataBuffer = Buffer.from(base64Data, 'base64')
            fs.writeFileSync(filePath, dataBuffer)
            newData.qr_code = path.join('public/imgs/itemGuideQRCode', task_code + '.png')
            // newData.qr_code = qr_code
        }
        if (zzzd !== null) newData.zzzd = zzzd
        var result = await modelTempTask.create(newData)
        return new SuccessModel({ msg: '创建成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '创建失败', data: err.message })
    }
}

/**
 * 删除事项指南
 * @param {Array<String>} task_code 事项指南编码
 * @returns 
 */
async function deleteItemGuides({
    task_code = null
}) {
    try {
        if (task_code === null) {
            throw new Error('删除事项指南至少需要task_code')
        }
        if (!task_code.length || task_code.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        //检查task_code的合法性
        for (let i = 0; i < task_code.length; i++) {
            var task = await modelTempTask.exists({ task_code: task_code[i] })
            if (task === false) {
                throw new Error('task_code不存在: ' + task_code[i])
            }
        }
        //批量删除
        var result = await modelTempTask.deleteMany({ task_code: { $in: task_code } })
        return new SuccessModel({ msg: '删除成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '删除失败', data: err.message })
    }
}

/**
 * 更新事项指南
 * @param {String} task_code 事项指南编码
 * @param {String} new_task_code 新的事项指南编码
 * @param {String} task_name 事项指南名称
 * @param {String} wsyy 已开通的网上办理方式
 * @param {Array<Number>} service_object_type 服务对象类型
 * @param {String} conditions 办理条件
 * @param {Array<Object>} legal_basis 法律法规依据
 * @param {Number} legal_period 法定期限
 * @param {String} legal_period_type 法定期限单位
 * @param {Number} promised_period 承诺期限
 * @param {String} promised_period_type 承诺期限单位
 * @param {Array<Object>} windows 办事窗口
 * @param {String} apply_content 申请内容
 * @param {String} ckbllc 窗口办理流程
 * @param {String} wsbllc 网上办理流程
 * @param {String} mobile_applt_website 移动端办理地址
 * @param {Array<Object>} submit_documents 提交材料
 * @param {String} zxpt 咨询平台
 * @param {String} qr_code 二维码
 * @param {String} zzzd 自助终端
 * @returns 
 */
async function updateItemGuide({
    task_code = null,
    new_task_code = null,
    task_name = null,
    wsyy = null,
    service_object_type = null,
    conditions = null,
    legal_basis = null,
    legal_period = null,
    legal_period_type = null,
    promised_period = null,
    promised_period_type = null,
    windows = null,
    apply_content = null,
    ckbllc = null,
    wsbllc = null,
    mobile_applt_website = null,
    submit_documents = null,
    zxpt = null,
    qr_code = null,
    zzzd = null
}) {
    try {
        if (task_code === null) {
            throw new Error('更新事项指南信息需要传入task_code')
        }
        if (task_code !== null) {
            let task = await modelTempTask.exists({ task_code: task_code })
            if (task === false) {
                throw new Error('事项指南编码不存在')
            }
        }
        var newData = {
            task_code: null,
            task_name: null,
            wsyy: null,
            service_object_type: null,
            conditions: null,
            legal_basis: null,
            legal_period: null,
            legal_period_type: null,
            promised_period: null,
            promised_period_type: null,
            windows: null,
            apply_content: null,
            ckbllc: null,
            wsbllc: null,
            mobile_applt_website: null,
            submit_documents: null,
            zxpt: null,
            qr_code: null,
            zzzd: null
        }
        var bulkOps = []
        if (new_task_code !== null) {
            let task = await modelTempTask.exists({
                task_code: { $in: new_task_code, $ne: task_code }
            })
            if (task === true) {
                throw new Error('存在相同的事项指南编码，不能重复: ' + new_task_code)
            }
            newData.task_code = new_task_code
            bulkOps.push({
                updateOne: {
                    filter: { task_code: task_code },
                    update: { task_code: new_task_code }
                }
            })
        }
        if (task_name !== null) newData.task_name = task_name
        if (wsyy !== null) newData.wsyy = wsyy
        if (service_object_type !== null) {
            let str = ''
            for (let i = 0; i < service_object_type.length; i++) {
                if (str === '') {
                    str += service_object_type[i].toString()
                } else {
                    str += ',' + service_object_type[i].toString()
                }
            }
            newData.service_object_type = str
        }
        if (conditions !== null) newData.conditions = conditions
        if (legal_basis !== null) newData.legal_basis = legal_basis
        if (legal_period !== null) newData.legal_period = legal_period
        if (legal_period_type !== null) newData.legal_period_type = legal_period_type
        if (promised_period !== null) newData.promised_period = promised_period
        if (promised_period_type !== null) newData.promised_period_type = promised_period_type
        if (windows !== null) newData.windows = windows
        if (apply_content !== null) newData.apply_content = apply_content
        if (ckbllc !== null) newData.ckbllc = ckbllc
        if (wsbllc !== null) newData.wsbllc = wsbllc
        if (mobile_applt_website !== null) newData.mobile_applt_website = mobile_applt_website
        if (submit_documents !== null) newData.submit_documents = submit_documents
        if (zxpt !== null) newData.zxpt = zxpt
        if (qr_code !== null) {
            var filePath = path.join('../public/imgs/itemGuideQRCode', task_code + '.png')
            var base64Data = qr_code.replace(/^data:image\/\w+;base64,/, '')
            var dataBuffer = Buffer.from(base64Data, 'base64')
            fs.writeFileSync(filePath, dataBuffer)
            newData.qr_code = path.join('public/imgs/itemGuideQRCode', task_code + '.png')
            // newData.qr_code = qr_code
        }
        if (zzzd !== null) newData.zzzd = zzzd
        var result = await modelTempTask.updateOne({ task_code: task_code }, newData)
        var result1 = await modelItem.bulkWrite(bulkOps)
        return new SuccessModel({ msg: '更新成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '更新失败', data: err.message })
    }
}

/**
 * 获取区划路径
 * @param {Array<String>} region_id 区划编码
 * @returns
 */
async function getRegionPaths({
    region_id = null
}) {
    try {
        if (region_id === null) {
            throw new Error('请求体中需要一个region_id属性，且该属性是一个数组')
        }
        if (region_id.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        //计算路径
        var regionDic = itemService.getRegionDic()
        if (regionDic === null) {
            throw new Error('请刷新重试')
        }
        var res = {}
        for (let i = 0; i < region_id.length; i++) {
            let regionPath = []
            let node = regionDic[region_id[i]] ? regionDic[region_id[i]] : null
            while (node !== null) {
                regionPath.unshift(node)
                node = regionDic[node.parentId] ? regionDic[node.parentId] : null
            }
            res[region_id[i]] = regionPath
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
 * @param {String} creator_name 创建人名称
 * @param {String} department_name 部门名称
 * @param {Number} start_time 创建时间的起始时间
 * @param {Number} end_time 创建时间的终止时间
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
    creator_name = null,
    department_name = null,
    start_time = null,
    end_time = null,
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
        if (creator_name !== null) query['creator.name'] = { $regex: creator_name }
        if (department_name !== null) query['creator.department_name'] = { $regex: department_name }
        var start = (start_time !== null) ? start_time : 0
        var end = (end_time !== null) ? end_time : 9999999999999
        query.create_time = { $gte: start, $lte: end }
        if (page_size !== null && page_num === null || page_size === null && page_num !== null) {
            throw new Error('page_size和page_num需要一起传')
        }
        if (page_size !== null && page_num !== null) {
            //只返回部分查询结果
            var dict = {}
            dict.data = await modelRegion.find(query, { __v: 0, children: 0 }).skip(page_num * page_size).limit(page_size)
            dict.total = await modelRegion.find(query).count()
            dict.page_size = page_size
            dict.page_num = page_num
            return new SuccessModel({ msg: '查询成功', data: dict })
        }
        var regions = await modelRegion.find(query, { __v: 0, children: 0 })
        //计算区划路径
        var regionDic = itemService.getRegionDic()
        if (regionDic === null) {
            throw new Error('请刷新重试')
        }
        for (let i = 0; i < regions.length; i++) {
            let regionPath = ''
            let node = regionDic[regions[i]._id] ? regionDic[regions[i]._id] : null
            while (node !== null) {
                regionPath = node.region_name + '/' + regionPath
                node = regionDic[node.parentId] ? regionDic[node.parentId] : null
            }
            regions[i]._doc.region_path = regionPath
        }
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
    user_id = null,
    items = null
}) {
    try {
        if (user_id === null || items === null) {
            throw new Error('需要user_id和items')
        }
        if (!items.length || items.length <= 0) {
            throw new Error('数组长度小于等于0')
        }
        //检查user_id
        var user = await modelUsers.findOne({ _id: user_id }, { __v: 0 })
        if (user === null) {
            throw new Error('user_id不存在: ' + user_id)
        }
        var department = await modelDepartmentMapUsers.findOne({ account: user.account }, { __v: 0 })
        if (department === null) {
            throw new Error('用户没有所属部门')
        }
        //遍历数组创建事项
        var newData = []
        var bulkOps = []
        for (let i = 0; i < items.length; i++) {
            //解构，没有传的字段默认是null
            let {
                task_code = null,
                rule_id = null,
                region_code = null,
                region_id = null
            } = items[i]
            if (task_code === null || rule_id === null || region_code === null || region_id === null) {
                throw new Error('task_code、rule_id、region_code和region_id必须同时存在')
            }
            //检查task_code的合法性
            let task = await modelTempTask.findOne({ task_code: task_code }, { _id: 0, __v: 0 })
            if (task === null) {
                throw new Error('task_code不存在: ' + task_code)
            }
            //检查rule_id的合法性
            let rule = await modelRule.exists({ rule_id: rule_id })
            if (rule === false) {
                throw new Error('rule_id不存在: ' + rule_id)
            }
            //检查region_code和region_id的合法性
            let region = await modelRegion.findOne({ region_code: region_code })
            if (region === null) {
                throw new Error('region_code不存在: ' + region_code)
            }
            if (region._id != region_id) {
                throw new Error('region_code和region_id不匹配: ' + region_code + '\t' + region_id)
            }
            newData.push({
                item_name: task.task_name,
                task_code: task_code,
                rule_id: rule_id,
                region_code: region_code,
                region_id: region_id,
                creator: {
                    id: user_id,
                    name: user.user_name,
                    department_name: department.department_name
                }
            })
            //修改对应事项指南的状态
            if (task.task_status === 0) {
                bulkOps.push({
                    updateOne: {
                        filter: { task_code: task_code },
                        update: { task_status: 1 }
                    }
                })
            }
        }
        //批量创建
        var result = await modelItem.create(newData)
        //批量更新
        var result1 = await modelTempTask.bulkWrite(bulkOps)
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
        var updateTasks = []
        for (let i = 0; i < items.length; i++) {
            //判断item_id的合法性
            let item = await modelItem.findOne({ _id: items[i] }, { __v: 0 })
            if (item === null) {
                throw new Error('_id错误: ' + items[i])
            }
            //检查对应事项指南的状态是否需要更改
            let count = await modelItem.find({ task_code: item.task_code, _id: { $ne: item._id } }).count()
            if (count <= 0) {
                //对应事项指南的状态改为未绑定
                updateTasks.push(item.task_code)
            }
        }
        //批量更新
        await modelTempTask.updateMany({ task_code: { $in: updateTasks } }, { task_status: 0 })
        //批量删除
        var result = await modelItem.deleteMany({ _id: { $in: items } })
        return new SuccessModel({ msg: '删除成功', data: result })
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
        var taskBulkOps = []
        for (let i = 0; i < items.length; i++) {
            //解构，默认null
            let {
                _id = null,
                task_code = null,
                rule_id = null,
                region_code = null,
                region_id = null
            } = items[i]
            if (_id === null) {
                throw new Error('更新事项信息需要传_id')
            }
            //判断_id的合法性
            let item = await modelItem.exists({ _id: _id })
            if (item === false) {
                throw new Error('_id不存在: ' + _id)
            }
            //更新item（差量）
            var newData = {}
            if (task_code !== null) {
                //检查task_code的合法性
                let task = await modelTempTask.exists({ task_code: task_code })
                if (task === false) {
                    throw new Error('task_code不存在: ' + task_code)
                }
                //检查是否需要更改对应事项指南的状态
                let count = await modelItem.find({ task_code: task_code }).count()
                if (count <= 1) {
                    taskBulkOps.push({
                        updateOne: {
                            filter: { task_code: task_code },
                            update: { task_status: 0 }
                        }
                    })
                }
                newData.task_code = task_code
            }
            if (rule_id !== null) {
                //检查rule_id的合法性
                let rule = await modelRule.exists({ rule_id: rule_id })
                if (rule === false) {
                    throw new Error('rule_id不存在: ' + rule_id)
                }
                newData.rule_id = rule_id
            }
            if (region_code !== null && region_id === null || region_code === null && region_id !== null) {
                throw new Error('更改事项所属区划的时候需要同时传region_code和region_id')
            }
            if (region_code !== null && region_id !== null) {
                //检查region_code的合法性
                let region = await modelRegion.findOne({ region_code: region_code }, { __v: 0 })
                if (region === null) {
                    throw new Error('region_code不存在')
                }
                if (region._id != region_id) {
                    throw new Error('region_code和region_id不匹配')
                }
                newData.region_code = region_code
                newData.region_id = region_id
            }
            bulkOps.push({
                updateOne: {
                    filter: { _id: _id },
                    update: newData
                }
            })
        }
        //批量更新
        var result1 = await modelTempTask.bulkWrite(taskBulkOps)
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
        var res = await modelItem.exists({
            rule_id: rule_id,
            region_code: region_code
        })
        //有事项haveItem是1，否则是0
        region._doc.haveItem = 0
        if (res === true) {
            region._doc.haveItem = 1
        }
        result.push(region._doc)
        //找出该区划的下级区划
        var regionDic = itemService.getRegionDic()
        var childRegions = regionDic[region._id].children
        for (let i = 0; i < childRegions.length; i++) {
            var value = regionDic[childRegions[i]]
            //遍历区划，检查该区划包括其全部下级区划在内是否存在rule_id对应的事项
            var regionCodes = []
            var q = []
            q.push(value._id)
            regionCodes.push(value.region_code)
            while (q.length > 0) {
                let len = q.length
                for (let j = 0; j < len; j++) {
                    let id = q.shift()
                    regionCodes.push(regionDic[id].region_code)
                    let children = regionDic[id].children
                    Array.prototype.push.apply(q, children)
                }
            }
            //找出匹配的事项
            var res = await modelItem.exists({
                rule_id: rule_id,
                region_code: { $in: regionCodes }
            })
            //子区划中有事项的haveItem是1，否则是0
            let r = Object.assign({}, value)
            r.haveItem = 0
            if (res === true) {
                r.haveItem = 1
            }
            result.push(r)
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
 * @param {String} creator_name 创建人名字
 * @param {String} department_name 部门名称
 * @param {Number} start_time 规则创建时间的起始时间
 * @param {Number} end_time 规则创建时间的终止时间
 * @returns
 */
async function getRules({
    rule_id = null,
    rule_name = null,
    parentId = null,
    creator_name = null,
    department_name = null,
    start_time = null,
    end_time = null
}) {
    try {
        var query = {}
        if (rule_id !== null) query.rule_id = { $in: rule_id }
        if (rule_name !== null) query.rule_name = { $regex: rule_name }
        else query.rule_name = { $ne: 'null' }
        if (parentId !== null) query.parentId = { $in: parentId }
        if (creator_name !== null) query['creator.name'] = { $regex: creator_name }
        if (department_name !== null) query['creator.department_name'] = { $regex: department_name }
        var start = (start_time !== null) ? start_time : 0
        var end = (end_time !== null) ? end_time : 9999999999999
        query.create_time = { $gte: start, $lte: end }
        var res = await modelRule.find(query, { __v: 0, children: 0 })
        //计算规则路径
        var ruleDic = itemService.getRuleDic()
        if (ruleDic === null) {
            throw new Error('请刷新重试')
        }
        for (let i = 0; i < res.length; i++) {
            let rulePath = ''
            let node = ruleDic[res[i].rule_id] ? ruleDic[res[i].rule_id] : null
            while (node !== null) {
                rulePath = node.rule_name + '/' + rulePath
                node = ruleDic[node.parentId] ? ruleDic[node.parentId] : null
            }
            res[i]._doc.rule_path = rulePath
        }
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
 * @param {String} parentId 上级区划的_id（必须是已有的区划）
 * @returns
 */
async function createRegion({
    user_id = null,
    region_code = null,
    region_name = null,
    region_level = null,
    parentId = null
}) {
    try {
        if (user_id === null) {
            throw new Error('需要user_id')
        }
        if (region_code === null || region_name === null || region_level === null || parentId === null) {
            throw new Error('创建区划的时候必须包括全部字段的信息，包括region_code、region_name、region_level和parentCode')
        }
        //检查user_id
        var user = await modelUsers.findOne({ _id: user_id }, { __v: 0 })
        if (user === null) {
            throw new Error('user_id不存在: ' + user_id)
        }
        var department = await modelDepartmentMapUsers.findOne({ account: user.account }, { __v: 0 })
        if (department === null) {
            throw new Error('用户没有所属部门')
        }
        //检查region_level和parentId的合法性
        var parent = await modelRegion.findOne({ _id: parentId }, { __v: 0 })
        if (parent === null) {
            throw new Error('parentId不存在: ' + parentId)
        }
        if (parent.region_level + 1 !== region_level) {
            throw new Error('region_level错误，上级区划的region_level是' + parent.region_level)
        }
        //创建区划
        var result = await modelRegion.create({
            region_code: region_code,
            region_name: region_name,
            region_level: region_level,
            parentId: parentId,
            creator: {
                id: user_id,
                name: user.user_name,
                department_name: department.department_name
            }
        })
        //更新父区划的children数组
        await modelRegion.updateOne({ _id: parentId }, { $push: { children: result._id.toString() } })
        //更新内存中的区划树
        itemService.addUpdateTask('createRegions', [result._id.toString()])
        //返回创建结果
        return new SuccessModel({ msg: '创建成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '创建失败', data: err.message })
    }
}

/**
 * 删除区划
 * @param {Array<String>} regions 待删除的区划
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
        var bulkOps = []
        for (let i = 0; i < regions.length; i++) {
            //判断region_id的合法性
            var rs = await modelRegion.findOne({ _id: regions[i] }, { __v: 0 })
            if (rs === null) {
                throw new Error('region_id不存在: ' + regions[i])
            }
            bulkOps.push({
                updateOne: {
                    filter: { _id: rs.parentId },
                    update: { $pull: { children: rs._id.toString() } }
                }
            })
        }
        bulkOps.push({
            deleteMany: {
                filter: { _id: { $in: regions } }
            }
        })
        //检查是否有事项指南与区划绑定
        var items = await modelItem.find({ region_id: { $in: regions } }, { __v: 0 }).count()
        if (items > 0) {
            return new SuccessModel({ msg: '删除区划失败，有与其绑定的事项还未处理', data: { code: 999 } })
        }
        //批量删除
        // await modelRegion.deleteMany({ _id: { $in: regions } })
        var result = await modelRegion.bulkWrite(bulkOps)
        //更新内存中的区划树
        itemService.addUpdateTask('deleteRegions', regions)
        //返回结果
        return new SuccessModel({ msg: '删除成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '删除失败', data: err.message })
    }
}

/**
 * 更新区划
 * @param {Array<Object>} regions 待更新的区划
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
        var regionBulkOps = []
        var itemBulkOps = []
        var region_id = []
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
            region_id.push(_id)
            //更新region
            let newData = {}
            if (region_code !== region.region_code) {
                newData.region_code = region_code
                itemBulkOps.push({
                    updateMany: {
                        filter: { region_id: _id },
                        update: { region_code: region_code }
                    }
                })
            }
            if (region_name !== null) newData.region_name = region_name
            if (region_level !== null) newData.region_level = region_level
            if (parentId !== null) {
                newData.parentId = parentId
                regionBulkOps.push({
                    updateOne: {
                        filter: { _id: region.parentId },
                        update: { $pull: { children: _id } }
                    }
                })
                regionBulkOps.push({
                    updateOne: {
                        filter: { _id: parentId },
                        update: { $push: { children: _id } }
                    }
                })
            }
            regionBulkOps.push({
                updateOne: {
                    filter: { _id: _id },
                    update: newData
                }
            })
        }
        //批量更新
        var result = await modelRegion.bulkWrite(regionBulkOps)
        await modelItem.bulkWrite(itemBulkOps)
        //更新内存中的区划树
        itemService.addUpdateTask('updateRegions', region_id)
        //返回结果
        return new SuccessModel({ msg: '更新成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '更新失败', data: err.message })
    }
}

/**
 * 改变事项的状态
 * @param {String} user_id 用户id
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
        var itemStatus = await modelItemStatus.find({}, { _id: 0, __v: 0 })
        for (let i = 0, len = items.length; i < len; i++) {
            //解构，默认null
            var { item_id = null, next_status = null } = items[i]
            if (item_id === null || next_status === null) {
                throw new Error('调用changeItemStatus必须有item_id和next_status字段')
            }
            //查询事项现在的状态
            var item = await modelItem.findOne({ _id: item_id }, { __v: 0 })
            if (item === null) {
                throw new Error('item_id不存在: ' + item_id)
            }
            //事项状态变到next_status
            for (let j = 0; j < itemStatus.length; j++) {
                var status = itemStatus[j]
                if (status.id !== item.item_status) {
                    if (j === itemStatus.length - 1) throw new Error('itemStatus表和数据库中已有的事项状态对不上')
                    continue
                }
                //判断能否变为next_status
                var keys = Object.keys(status.next_status)
                for (let k = 0; k < keys.length; k++) {
                    if (status.next_status[keys[k]] === next_status) {
                        break
                    }
                    if (k === keys.length - 1) {
                        throw new Error('事项所处状态无法变到指定状态: ' + item_id)
                    }
                }
                if (can_operate.includes(status.id) === false) {
                    throw new Error('该用户无法修改状态为\"' + status.name + '\"的事项')
                }
                //加到数组中，后续一起更新
                bulkOps.push({
                    updateOne: {
                        filter: { _id: item_id },
                        update: { item_status: next_status }
                    }
                })
                //如果是转到审核通过状态，就更新一下事项的发布时间
                if (status.eng_name === 'Success') {
                    bulkOps.push({
                        updateOne: {
                            filter: { _id: item_id },
                            update: { release_time: Date.now() }
                        }
                    })
                }
                break
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
 * 添加审核意见
 * @param {String} item_id 事项id
 * @param {Number} rank 几级审核（从1开始）
 * @param {String} user_id 用户id
 * @param {String} advise 审核意见
 * @returns 
 */
async function addAuditAdvise({
    item_id = null,
    user_id = null,
    advise = null
}) {
    try {
        if (item_id === null || user_id === null || advise === null) {
            throw new Error('需要item_id、user_id和advise')
        }
        var item = await modelItem.findOne({ _id: item_id }, { __v: 0 })
        if (item === null) {
            throw new Error('item_id不存在')
        }
        var user = await modelUsers.findOne({ _id: user_id }, { __v: 0 })
        if (user === null) {
            throw new Error('user_id不存在')
        }
        var advises = item._doc.audit_advises
        advises.push({
            time: Date.now(),
            user_id: user_id,
            user_name: user.user_name,
            advise: (advise !== null) ? advise : ''
        })
        var result = await modelItem.updateOne({ _id: item_id }, { audit_advises: advises })
        return new SuccessModel({ msg: '添加成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '添加失败', data: err.message })
    }
}

/**
 * 获取事项指南和审核意见
 * @param {String} item_id 事项id
 * @returns 
 */
async function getItemGuideAndAuditAdvises({
    item_id = null
}) {
    try {
        if (item_id === null) {
            throw new Error('需要item_id')
        }
        var item = await modelItem.findOne({ _id: item_id }, { task_code: 1, audit_advises: 1 })
        var itemGuide = await modelTempTask.findOne({ task_code: item.task_code }, { _id: 0, __v: 0 })
        var result = itemGuide._doc
        result.audit_advises = item.audit_advises
        return new SuccessModel({ msg: '获取成功', data: result })
    } catch (err) {
        return new ErrorModel({ msg: '获取失败', data: err.message })
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

/**
 * 用于临时提升用户权限
 * @param {Array<Object>} array 
 * @returns 
 */
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

// async function getRuleDic({
//     rule_id = null
// }) {
//     var ruleDic = itemService.getRuleDic()
//     if (rule_id !== null) {
//         return new SuccessModel({ msg: '获取成功', data: ruleDic[rule_id] })
//     }
//     return new SuccessModel({ msg: '获取成功', data: ruleDic })
// }

// async function getRegionDic({
//     region_id = null
// }) {
//     var regionDic = itemService.getRegionDic()
//     if (region_id !== null) {
//         return new SuccessModel({ msg: '获取成功', data: regionDic[region_id] })
//     }
//     return new SuccessModel({ msg: '获取成功', data: regionDic })
// }

module.exports = {
    getItemStatusScheme,
    getUserRank,
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
    getItemGuides,
    createItemGuide,
    deleteItemGuides,
    updateItemGuide,
    addAuditAdvise,
    getItemGuideAndAuditAdvises,
    // getRuleDic,
    // getRegionDic
}
