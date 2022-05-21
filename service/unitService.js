const unit = require('../model/unit');
const users = require('../model/users');
const department = require('../model/department');
const departmentMapUser = require('../model/departmentMapUser');
const { SuccessModel, ErrorModel } = require('../utils/resultModel');

class unitService {
  // 添加单位
  async addUnit (unit_name, parent_unit) {
    // 使用时间戳来做自增id
    const res = await unit.create({
      unit_name,
      unit_id: Date.now(),
      parent_unit,
    });
    return new SuccessModel({
      msg: '添加成功',
      data: res
    });
  }

  // 删除单位
  async deleteUnit (unit_id) {
    const isExist = await unit.find({ unit_id });
    const isHaveChild = await unit.find({parent_unit: unit_id});
    if (isExist.length === 0 || isHaveChild.length === 0) {
      return new ErrorModel({
        msg: '删除失败',
      });
    }
    const res = await unit.deleteOne({ unit_id });
    return new SuccessModel({
      msg: '删除成功',
      data: res
    });
  }

  // 修改单位
  async updateUnit (unit_id, new_unit_name) {
    const res = await unit.updateOne({ unit_id }, {
      unit_name: new_unit_name
    });
    return new SuccessModel({
      msg: '更新成功',
      data: res
    });
  }

  // 查询单位
  async lookupUnit (unit_id) {
    const res = await unit.findOne({ unit_id });
    return new SuccessModel({
      msg: '查询成功',
      data: res
    });
  }

  // 查找父单位
  async findParent (unit_id) {
    const res = await unit.find({ unit_id });
    const parent_unit = res.parent_unit;
    const result = await unit.findOne({ unit: parent_unit });
    return result;
  }

  // 查找子单位
  async findChild (unit_id) {
    const res = await unit.find({ parent_unit: unit_id });
    return res.map(item => {
      return {
        _id: item._id,
        unit_name: item.unit_name,
        unit_id: item.unit_id,
        parent_unit: item.parent_unit,
      }
    });
  }

  // 单位列表[树型结构]
  async unitTree () {
    let rootTemp = await unit.findOne({ parent_unit: 0 }, {'__v': 0});
    let root = {
      _id: rootTemp._id,
      unit_name: rootTemp.unit_name,
      unit_id: rootTemp.unit_id,
      parent_unit: rootTemp.parent_unit,
    }
    let that = this;
    async function renderTree (root) {
      if (!root) {
        return;
      }
      let children = await that.findChild(root.unit_id);
      if (children.length > 0) {
        root.children = children;
        for (let index in root.children) {
          // 注意了
          await renderTree(root.children[index]);
        }
      } else {
        return;
      }
    }
    await renderTree(root);
    return new SuccessModel({
      msg: "获取列表成功",
      data: root
    });
  }

  // 生成单位编号
  async createUnitToken (unit_id) {
    let token = `${unit_id}`;
    let parent = null;
    while (1) {
      parent = await this.findParent(unit_id);
      if (!parent) {
        break;
      } else {
        token = parent.unit_id + '-' + token;
      }
    }
    return token;
  }

  // 搜索单位
  async searchUnit (searchValue) {
    const reg = new RegExp(searchValue, 'i')
    const root = await unit.findOne({ parent_unit: 0 });

    let that = this;
    async function renderTreeByReg (root, reg) {
      if (!root) {
        return;
      }
      let _children = await that.findChild(root.unit_id)
      let children = _children.filter(item => { 
        return reg.test(item.unit_name) 
      });
      if (children.length > 0) {
        root.children = children;
        for (let index in root.children) {
          await renderTree(root.children[index], reg);
        }
      } else {
        return;
      }
    }
    await renderTreeByReg(root, reg);
    return new SuccessModel({
      msg: "搜索成功",
      data: root
    });
  }
}

module.exports = new unitService();