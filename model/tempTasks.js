const mongoose = require('mongoose')

const tempTaskSchema = new mongoose.Schema({
    task_status: Number,            //事项指南状态，0是未绑定规则，1是已绑定规则
    task_code: String,              //事项指南编码
    task_name: String,              //事项指南名称
    accept_time: String,            //受理时限，以&&分隔，第一个数字表示受理时限，第二个数字表示受理时限单位
    wsyy: String,                   //已开通的网上办理方式，以&&分隔，数字表示方式，"-"后面是相应的地址
    service_object_type: String,    //服务对象类型
    conditions: String,             //办理条件（申请条件）
    legal_basis: Array,             //法律法规依据
    approval_conditions: Array,     //审批条件
    legal_period: Number,           //法定期限
    legal_period_type: String,      //法定期限单位
    promised_period: Number,        //承诺期限
    promised_period_type: String,   //承诺期限单位
    apply_time: String,             //申请时限
    accept_time_sp: String,         //办理时限说明
    windows: Array,                 //办事窗口
    apply_content: String,          //申请内容
    serviceCheckConsult: Object,    //审批咨询
    acceptType: String,             //受理形式
    ckbllc: String,                 //窗口办理流程说明
    wsbllc: String,                 //网上办理流程说明
    mobile_applt_website: String,   //移动端办理地址
    link_way: String,               //咨询方式
    submit_documents: Array         //提交材料
})

const tempTasks = mongoose.model('tempTasks', tempTaskSchema, 'tempTasks')
module.exports = tempTasks