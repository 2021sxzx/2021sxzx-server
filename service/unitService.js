const unit = require('../model/unit');
const users = require('../model/users');
const department = require('../model/department');
const { SuccessModel, ErrorModel } = require('../utils/resultModel');

class unitService {
  // 添加单位
  async addUnit (unit_name, parent_unit) {
    // 使用时间戳来做自增id
    await unit.create({
      unit_name,
      unit_id: Date.now(),
      parent_unit,
    });
    const res = await this.unitTree();
    return new SuccessModel({
      msg: '添加成功',
      data: res
    });
  }

  // 删除单位
  async deleteUnit (unit_id) {
    const isExist = await unit.find({ unit_id });
    const isHaveChild = await unit.find({parent_unit: unit_id});
    const isUsed = await users.find({ unit_id });
    console.log(isExist.length);
    console.log(isHaveChild.length);
    if (isExist.length === 0 || isHaveChild.length !== 0 || isUsed.length !== 0) {
      return new ErrorModel({
        msg: '删除失败',
      });
    }
    await unit.deleteOne({ unit_id });
    const res = await this.unitTree();
    return new SuccessModel({
      msg: '删除成功',
      data: res
    });
  }

  // 修改单位
  async updateUnit (unit_id, new_unit_name) {
    await unit.updateOne({ unit_id }, {
      unit_name: new_unit_name
    });
    const res = await this.unitTree();
    return new SuccessModel({
      msg: '更新成功',
      data: res
    });
  }

  // 查询单位名称
  async lookupUnit (unit_id) {
    if (Number.isNaN(unit_id)) {
      return '无单位';
    }
    const res = await unit.findOne({ unit_id });
    return !(res.unit_name === null || res.unit_name === undefined) ? res.unit_name : '无单位';
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
    const users = await this.calculateUser(rootTemp.unit_id);
    let root = {
      _id: rootTemp._id,
      unit_name: rootTemp.unit_name,
      unit_id: rootTemp.unit_id,
      parent_unit: rootTemp.parent_unit,
    }
    if (users.length !== 0) {
      root.users = users;
    }
    let that = this;
    async function renderTree (root) {
      if (!root) {
        return;
      }
      let children = await that.findChild(root.unit_id);
      let users = await that.calculateUser(root.unit_id);
      if (users.length !== 0) {
        root.users = users;
      }
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

  // 生成单位编号
  async createUnitToken (unit_id) {
    let token = `${unit_id}`;
    let parent = null;
    let that = this;
    while (1) {
      parent = await that.findParent(unit_id);
      if (!parent) {
        break;
      } else {
        token = String(parent.unit_id) + '-' + token;
      }
    }
    return token;
  }

  // 比对，发现是否为父子单位关系
  // 用于筛选用户管理访问控制专用
  async compareAndJudge (unit_id1, unit_id2) {
    const res = await this.findParent(unit_id2);
    if (unit_id1 == res.unit_id) {
      return true;
    } else {
      return false;
    }
  }

  // 根据单位计算级别
  async calculateRank (unit_id) {
    let res = await this.createUnitToken(unit_id);
    let rank = res.split('-').length;
    return rank;
  }

  // 计算单位下有多少人
  async calculateUser (unit_id) {
    const res = await users.find({unit_id});
    return res;
  }
}

module.exports = new unitService();