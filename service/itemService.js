const modelRule = require('../model/rule')
const modelRegion = require('../model/region')

var regionCodeDic = { status: 0, data: {} }
var regionIdDic = { status: 0, data: {} }
var ruleDic = { status: 0, data: {} }

var promiseList = []

function updateData() {
    return new Promise(async function (resolve, reject) {
        try {
            //初始化区划树
            var regions = await modelRegion.find({}, { __v: 0 })
            for (let i = 0, len = regions.length; i < len; i++) {
                regionCodeDic.data[regions[i].region_code] = Object.assign({}, regions[i])
                regionIdDic.data[regions[i]._id] = Object.assign({}, regions[i])
                regionCodeDic.data[regions[i].region_code].children = []
            }
            //初始化区划树节点的children数组
            var keys = Object.keys(regionCodeDic.data)
            for (let i = 0, len = keys.length; i < len; i++) {
                var region = regionCodeDic.data[keys[i]]
                var parent = regionIdDic.data[region.parentId]
                if (parent) {
                    regionCodeDic.data[parent.region_code].children.push(keys[i])
                }
            }
            //区划树完成
            regionCodeDic.status = 1
            regionIdDic.status = 1
            //初始化规则树
            var rules = await modelRule.find({ rule_name: { $ne: 'null' } }, { _id: 0, __v: 0 })
            for (let i = 0, len = rules.length; i < len; i++) {
                ruleDic.data[rules[i].rule_id] = Object.assign({}, rules[i])
                ruleDic.data[rules[i].rule_id].children = []
            }
            //初始化规则树节点的children数组
            var ruleKeys = Object.keys(ruleDic.data)
            for (let i = 0, len = ruleKeys.length; i < len; i++) {
                var rule = ruleDic.data[ruleKeys[i]]
                var parent = ruleDic.data[rule.parentId]
                if (parent) {
                    parent.children.push(ruleKeys[i])
                }
            }
            //规则树完成
            ruleDic.status = 1
            console.log('Get Region Tree And Rule Tree !!!')
            resolve()
        } catch (err) {
            reject(err.message)
        }
    })
}

async function getRegionCodeDic() {
    try {
        //当前内存中的regionCodeDic可用
        if (regionCodeDic.status === 1) {
            return regionCodeDic.data
        }
        //当前内存中的不可用，需要等待更新
        //检查是否正在更新
        if (promiseList.length > 0) {
            var result = await Promise.all(promiseList)
            return regionCodeDic.data
        }
        //创建一个更新任务
        promiseList.push(updateData())
        var result = await Promise.all(promiseList)
        return regionCodeDic.data
    } catch (err) {
        console.log(err.message)
        return null
    }
}

async function getRegionIdDic() {
    try {
        //当前内存中的regionIdDic可用
        if (regionIdDic.status === 1) {
            return regionIdDic.data
        }
        //当前内存中的不可用，需要等待更新
        //检查是否正在更新
        if (promiseList.length > 0) {
            var result = await Promise.all(promiseList)
            return regionIdDic.data
        }
        //创建一个更新任务
        promiseList.push(updateData())
        var result = await Promise.all(promiseList)
        return regionIdDic.data
    } catch (err) {
        console.log(err.message)
        return null
    }
}