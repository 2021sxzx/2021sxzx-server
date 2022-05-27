const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    create_time: {            //事项指南创建时间
        type: Number,
        default: Date.now(),
    },
    task_status: {            //事项指南状态，0是未绑定规则，1是已绑定规则
        type: Number,
        default: 0,
    },
    task_code: {              //事项指南编码
        type: String,
        required: true,
        index: {
            unique: true,
            sparse: true
        }
    },
    task_name: {              //事项指南名称
        type: String,
        required: true,
    },
    // accept_time: String,            //受理时限，以&&分隔，第一个数字表示受理时限，第二个数字表示受理时限单位
    wsyy: {                   //已开通的网上办理方式，以&&分隔，数字表示方式，"-"后面是相应的地址
        type: String,
        default: '',
    },
    service_object_type: {    //服务对象类型
        type: String,
        // required: true,
    },
    conditions: {             //办理条件（申请条件）
        type: String,
        default: '',
    },
    legal_basis: {            //法律法规依据
        type: [{
            name: {
                type: String,
                required: true,
            }
        }],
        default: [],
    },
    // approval_conditions: Array,     //审批条件
    legal_period: {           //法定期限
        type: Number,
        // required: true,
    },
    legal_period_type: {      //法定期限单位
        type: String,
        // required: true,
    },
    promised_period: {        //承诺期限
        type: Number,
        // required: true,
    },
    promised_period_type: {   //承诺期限单位
        type: String,
        // required: true,
    },
    // apply_time: String,             //申请时限
    // accept_time_sp: String,         //办理时限说明
    windows: {                //办事窗口
        type: [{
            name: {           //窗口名称
                type: String,
                required: true,
            },
            phone: {          //电话
                type: String,
                required: true,
            },
            address: {        //地址
                type: String,
                required: true
            },
            office_hour: {    //办公时间
                type: String,
                required: true
            }
        }],
        default: [],
    },
    apply_content: {          //申请内容
        type: String,
        default: '',
    },
    // serviceCheckConsult: Object,    //审批咨询
    // acceptType: String,             //受理形式
    ckbllc: {                 //窗口办理流程说明
        type: String,
        default: '',
    },
    wsbllc: {                 //网上办理流程说明
        type: String,
        default: '',
    },
    mobile_applt_website: {   //移动端办理地址
        type: String,
        default: '',
    },
    // link_way: String,               //咨询方式
    submit_documents: {       //提交材料
        type: [{
            materials_name: {
                type: String,
                required: true,
            },
            origin: {
                type: Number,
                required: true
            },
            copy: {
                type: Number,
                required: true
            },
            material_form: {
                type: String,
                required: true
            },
            page_format: {
                type: String,
                required: false
            },
            material_necessity: {
                type: String,
                required: true
            },
            material_type: {
                type: String,
                required: true
            },
            submissionrequired: {
                type: String,
                required: true
            }
        }],
        default: [],
    },
    zxpt: {                   //咨询平台
        type: String,
        default: '',
    },
    qr_code: {                //二维码
        type: String,
        default: '',
    },
    zzzd: {                   //自助终端
        type: String,
        default: '',
    },
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    }
})

const task = mongoose.model('task', taskSchema, 'tempTasks')
module.exports = task