const fs = require('fs');

// TODO: 新增需要导出的数据标题, 并在standardizingItemGuideData方法中返回对于的标准数据
const detailTitle = {
    taskName: '事项名称', // 0（索引，下标）
    taskCode: '事项代码', // 1
    serviceAgentName: '实施主体名称', // 2
    serviceAgentCode: '组织编码', // 3
    applyContent: '事项内容', // 4
    legalBasis: '政策依据', // 5
    conditions: '申办所需审核条件', // 6
    materials: '申办所需材料', // 7
    timeLimit: '审核时限', // 8
    consultingPlatform: '咨询平台', // 9
    PCTerminal: '网办PC端', // 10
    mobileTerminal: '网办移动端', // 11
    selfServiceTerminal: '自助终端', // 12
    onlineProcessingProcess: '网上办理流程', // 13
    offlineProcessingProcess: '线下办理流程', // 14
    windowInfo: '办理点信息', // 15
    serviceObjectType: '服务对象类型', // 16
    taskStatusType: '事项绑定情况', // 17
}
const serviceType = {
    '1': '自然人',
    '2': '企业法人',
    '3': '事业法人',
    '4': '社会组织法人',
    '5': '非法人企业',
    '6': '行政机关',
    '9': '其他组织'
}
const necessityType = {
    '1': '必要',
    '2': '非必要',
    '3': '容缺后补'
}
const typesType = {
    '1': '证件证书证明',
    '2': '申请表格文书',
    '3': '其他'
}
const formType = {
    '1': '纸质',
    '2': '电子化',
    '3': '纸质/电子化'
}
const requiredType = {
    '0': '否',
    '1': '是'
}
const taskStatus = {
    0: '未绑定',
    1: '已绑定',
}
/**
 * 
 * @param {String[]} titles 标题
 * @param {Object[]} datas json数据
 * @param {String} flag 是否追加数据
 */
async function jsonToExcel(titles, datas, flag = null) {
    // 创建 Excel 文件流
    let writeStream = null
    if(flag) {
        writeStream = fs.createWriteStream('全量导出.csv', {flags: 'a'}); // 追加数据
    }  
    else {
        writeStream = fs.createWriteStream('全量导出.csv');
    }
    writeStream.on('finish', () => {
        console.log('成功生成全量导出.csv')
    })
    writeStream.on('error', (err) => {
        console.log(`生成全量导出.csv失败: ${err}`)
    })

    let excelLine = [];

    // 写入列标题
    for(let title of Object.values(titles)){
        excelLine.push(`"${title}",`)
    }
    excelLine.push('\n')
    let strLine = '\ufeff' + excelLine.join('')
    let buffer = Buffer.from(strLine, 'utf-8')
    writeStream.write(buffer)
    excelLine = [];
    
    // 遍历 JSON 数据并逐行写入
    // TODO: 分批查询数据并写入文件
    // 标准化导出数据
    for(let i = 0; i < datas.length; i++) {
        datas[i] = standardizingItemGuideData(datas[i])
        datas[i] = standardItemGuideToExportFormat(datas[i])
    }
    // 将数据内容拼接成 csv 规范的字符串
    // 增加\t为了不让表格显示科学计数法或者其他格式
    // e.g. csvStr = '"标题1","标题2","标题3"\n"1"\t,"2"\t,"3"\t,\n"4"\t,"5"\t,"6"\t,\n'
    for (let col of datas) {
        for (let value of Object.values(col)) {
            if (typeof value !== 'string') value = '' // 防止其他类型数据处理，一般不会，前面已经标准化数据
            excelLine.push(`"${value.replace(/"/g, '\"\"')}"\t,`)
        }
        // 一个数据结束后需要换行
        excelLine.push('\n')
        
        strLine = excelLine.join('')
        buffer = Buffer.from(strLine, 'utf-8')
        writeStream.write(buffer)
        excelLine = [];
    }

    // 结束写入并关闭流
    writeStream.end();
}

/**
 * 标准化从后端获取的事项指南的数据 返回需要导出的属性，并按标题顺序排列
 * @param data {*}从后端直接获取的事项指南的数据。（TODO:重构时，这块接口文档缺失，数据格式日后补充）
 * @return {{
*     taskName: string,
*     taskCode: string,
*     serviceAgentName: string,
*     serviceAgentCode: string,
*     applyContent: string,
*     legalBasis: string,
*     conditions: string,
*     materials: [{
*         materialName: string,
*         materialDetail: string,
*     }],
*     timeLimit: string,
*     consultingPlatform: string,
*     PCTerminal: string,
*     mobileTerminal: string,
*     selfServiceTerminal: string,
*     onlineProcessingProcess: string,
*     offlineProcessingProcess: string,
*     windowInfo: [{
*         windowName: string,
*         windowDetail: string,
*     }],
*     serviceObjectType: string,
*     taskStatus: number
* }}
*/
const standardizingItemGuideData = (data) => {
   // TODO: 补充注释的数据类型
   // console.log('standardizingItemGuideData', data)
   if(!data) return
   // 政策依据数组处理
   let legalBasis = ''
   if (data.legal_basis) {
       for (let i = 0; i < data.legal_basis.length; i++) {
           legalBasis += ((i + 1) + '.' + data.legal_basis[i].name + '\n')
       }
   }

   // 申办材料数组处理
   const materials = []

   if (data.submit_documents && data.submit_documents.length > 0) {
       data.submit_documents.forEach((item) => {
           if (item.materials_name) {
               materials.push({
                   materialName: item.materials_name,
                   materialDetail: `原件数量：${item.origin}\n` +
                       `复印件数量：${item.copy}\n` +
                       (item.material_form ? `材料形式：${formType[item.material_form]}\n` : '') +
                       (item.page_format ? `纸质材料规格：${item.page_format}\n` : '') +
                       (item.material_necessity ? `是否必要：${necessityType[item.material_necessity]}\n` : '') +
                       (item.material_type ? `材料类型：${typesType[item.material_type]}\n` : '') +
                       (item.submissionrequired ? `是否免提交：${requiredType[item.submissionrequired]}\n` : ''),
               })
           }
       })
   }

   // 审核时限格式处理
   let timeLimit = ''
   if (data.legal_period_type) {
       timeLimit += ('法定办结时限：' + data.legal_period + '个' +
           (data.legal_period_type === '1' ? '工作日' : '自然日'))
   }
   if (data.promised_period_type) {
       if (timeLimit !== '') timeLimit += '\n'
       timeLimit += ('承诺办结时限：' + data.promised_period + '个' +
           (data.promised_period_type === '1' ? '工作日' : '自然日'))
   }

   //办理点信息
   const windowInfo = []

   if (data.windows && data.windows.length > 0) {
       data.windows.forEach((item) => {
           if (item.name) {
               windowInfo.push({
                   windowName: item.name,
                   windowDetail: `办理地点：${item.address}\n\n` +
                       `咨询及投诉电话：${item.phone}\n\n` +
                       `办公时间：${item.office_hour}\n\n`
               })
           }
       })
   }

   // 服务对象类型数组处理
   const type = data.service_object_type? data.service_object_type.split(',') : []
   let serviceObjectType = ''
   for (let i = 0; i < type.length; i++) {
       if (serviceObjectType !== '') serviceObjectType += '、'
       serviceObjectType += serviceType[type[i]]
   }

   // 事项绑定情况
   let taskStatusType = taskStatus[data.task_status]

   // 事项详情数据
   return {
       taskName: data.task_name ? data.task_name : '', // '事项名称', 0
       taskCode: data.task_code ? data.task_code : '', // '事项代码', 1
       serviceAgentName: data.service_agent_name ? data.service_agent_name : '', // '实施主体名称', 2
       serviceAgentCode: data.service_agent_code ? data.service_agent_code : '', // '实施主体编码', 3
       applyContent: data.apply_content ? data.apply_content : '', // '事项内容', 4
       legalBasis: legalBasis, // '政策依据', 5
       conditions: data.conditions ? data.conditions : '',// '申办所需审核条件', 6
       materials: materials, // '申办所需材料', 7
       timeLimit: timeLimit, // '审核时限', 8
       consultingPlatform: data.zxpt ? data.zxpt : '', // '咨询平台', 9
       PCTerminal: data.wsyy ? data.wsyy : '', // '网办PC端', 10
       mobileTerminal: data.mobile_applt_website ? data.mobile_applt_website : '', // '网办移动端', 11
       selfServiceTerminal: data.zzzd ? data.zzzd : '', // '自助终端', 12
       onlineProcessingProcess: data.wsbllc ? data.wsbllc : '', // '网上办理流程', 13
       offlineProcessingProcess: data.ckbllc ? data.ckbllc : '', // '线下办理流程', 14
       windowInfo: windowInfo, // '办理点信息', 15
       serviceObjectType: serviceObjectType, // '服务对象类型', 16
       taskStatusType: taskStatusType, // '事项绑定情况' 17
   }
}

/**
 * 将标准的事项指南数据格式转化为导出需要的数据格式。把类型为对象的属性转为字符串
 * @param detailData {{
 *     taskName: string,
 *     taskCode: string,
 *     serviceAgentName: string,
 *     serviceAgentCode: string,
 *     applyContent: string,
 *     legalBasis: string,
 *     conditions: string,
 *     materials: [{
 *         materialName: string,
 *         materialDetail: string,
 *     }],
 *     timeLimit: string,
 *     consultingPlatform: string,
 *     PCTerminal: string,
 *     mobileTerminal: string,
 *     selfServiceTerminal: string,
 *     onlineProcessingProcess: string,
 *     offlineProcessingProcess: string,
 *     windowInfo: [{
 *         windowName: string,
 *         windowDetail: string,
 *     }],
 *     serviceObjectType: string,
 * }}
 * @return {{
*     taskName: string,
*     taskCode: string,
*     serviceAgentName: string,
*     serviceAgentCode: string,
*     applyContent: string,
*     legalBasis: string,
*     conditions: string,
*     materials: string,
*     timeLimit: string,
*     consultingPlatform: string,
*     PCTerminal: string,
*     mobileTerminal: string,
*     selfServiceTerminal: string,
*     onlineProcessingProcess: string,
*     offlineProcessingProcess: string,
*     windowInfo: string,
*     serviceObjectType: string,
* }}
*/
const standardItemGuideToExportFormat = (detailData) => {
   const exportData = {}
   Object.assign(exportData, detailData)

   // 将办理材料信息转化为字符串
   let materialsStr = ''
   for (let item of exportData.materials) {
       materialsStr += `${item.materialName}（\n${item.materialDetail}）;\n`
   }
   exportData.materials = materialsStr

   // 将办理窗口信息转化为字符串
   let windowInfo = ''
   for (let item of exportData.windowInfo) {
       windowInfo += `${item.windowName}（\n${item.windowDetail}）;\n`
   }
   exportData.windowInfo = windowInfo

   return exportData
}

// jsonToExcel(detailTitle, data)

module.exports = {
    detailTitle: detailTitle,
    jsonToExcel: jsonToExcel
}
