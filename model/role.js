const mongoose = require("mongoose")

//角色表的定义
const roleSchema = new mongoose.Schema({
  role_name: {   // 角色名称
    type: String,
    required: [true,'请传入角色名称，角色名不能为空'],
    maxlength:[50,'角色名长度不能超过50个字符']
  },
  role_describe: { // 角色描述
    type: String,
    maxlength:[500,'角色描述长度不能超过500个字符'],
    default:'角色描述暂未添加'
  },
  permissions: { // 权限，某个页面的完全访问权限
    home_page: { //首页
      type: Boolean,
      default: true
    },
    personal_page: { // 个人中心
      type: Boolean,
      default: true
    },
    item_audit: { // 事项审核
      type: Boolean,
      default: false
    },

    // XXX(钟卓江)：事项管理这个权限用树形/分级的结构实现会比较好，
    // 因为只有其中部分页面的访问权限能够完成的业务流程并不完整。
    // 用树形/分级结构来实现可以方便角色授权时的操作，防止过于繁琐和错漏
    /**
     * i.e.
     * item_manage:{
     *   item_manage_process:{},
     *   item_manage_guide:{},
     *   item_manage_rule:{}
     * }
     */
    item_manage: { // 事项管理
      type: Boolean,
      default: false
    },
    item_manage_process: { // 事项过程管理
      type: Boolean,
      default: false
    },
    item_manage_guide: { // 事项指南管理
      type: Boolean,
      default: false
    },
    item_manage_rule: { // 事项规则管理
      type: Boolean,
      default: false
    },

    // XXX(钟卓江)：系统管理这个权限用树形/分级的结构实现会比较好，理由同事项管理那部分一样
    system_manage: { // 系统管理
      type: Boolean,
      default: false
    },
    system_manage_journal: { // 日志管理，XXX(钟卓江): 叫joural感觉怪怪的，感觉log更贴切
      type: Boolean,
      default: false
    },
    system_manage_resource: { // 资源管理
      type: Boolean,
      default: false
    },

    // XXX(钟卓江)：用户评价管理这个权限用树形/分级的结构实现会比较好，理由同事项管理那部分一样
    comment_manage: { // 用户评价管理
      type: Boolean,
      default: false
    },
    comment_manage_list: { // 用户评价
      type: Boolean,
      default: false
    },
    comment_manage_report: { // 用户评价报告
      type: Boolean,
      default: false
    },

    // TODO(钟卓江)：用户管理这个权限用树形/分级的结构实现会比较好，理由同事项管理那部分一样
    user_manage: { // 用户管理
      type: Boolean,
      default: false
    },
    user_manage_account: { // 后台账号管理
      type: Boolean,
      default: false
    },
    user_manage_role: { // 角色管理
      type: Boolean,
      default: false
    },
    user_manage_department: { // 部门管理
      type: Boolean,
      default: false
    },
    user_manage_metaData: { // 用户资料元数据管理
      type: Boolean,
      default: false
    },
  }
})

const role = mongoose.model('role', roleSchema)
module.exports = role
