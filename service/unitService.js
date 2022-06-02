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

  // 重构后的单位列表渲染
  async newUnitTree () {
    try {
      async function getAggregate () {
        try {
          const res = await unit.aggregate([
            {
              $lookup: {
                from: 'users',
                localField: 'unit_id',
                foreignField: 'unit_id',
                as: "users"
              }
            }, {
              $project: {
                _id: 0,
                unit_id: 1,
                unit_name: 1,
                parent_unit: 1,
                users: 1
              }
            }
          ]);
          return res;
        } catch (error) {
          return new ErrorModel({
            msg: "获得单位列表失败",
            data: error.message
          })
        }
      }

      async function findRoot (allData) {
        const res = allData.filter(item => item.parent_unit == 0);
        return res[0];
      }

      async function findChild (unit_id, allData) {
        const resArr = allData.filter(item => item.parent_unit == unit_id);
        return resArr;
      }

      async function renderTree (root, allData) {
        const children = await findChild(root.unit_id, allData);
        if (children.length > 0) {
          root['children'] = children;
          for (let i = 0; i < children.length; i++) {
            await renderTree(children[i], allData);
          }
        }
      }
      const allData = await getAggregate();
      const root = await findRoot(allData);
      await renderTree(root, allData)
      return root;
    } catch (error) {
      throw new ErrorModel({
        msg: "单位信息处理失败",
        data: e.message
      });
    }
  }

  // 搜索单位
  async searchUnit (searchValue) {
    const reg = new RegExp(searchValue, 'i');
    const res = await unit.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'unit_id',
          foreignField: 'unit_id',
          as: "users"
        }
      }, {
        $match: {
          unit_name: { $regex: reg }
        }
      }, {
        $project: {
          _id: 0,
          unit_id: 1,
          unit_name: 1,
          parent_unit: 1,
          users: 1
        }
      }
    ])

    return new SuccessModel({
      msg: "搜索成功",
      data: res
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