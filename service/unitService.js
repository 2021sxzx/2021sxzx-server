const unit = require('../model/unit')
const users = require('../model/users')
const department = require('../model/department')
const { SuccessModel, ErrorModel } = require('../utils/resultModel')

class unitService {
  // 添加单位
  async addUnit(unit_name, parent_unit) {
    // 使用时间戳来做自增id
    await unit.create({
      unit_name,
      unit_id: Date.now(),
      parent_unit,
    })
    const res = await this.newUnitTree()
    return new SuccessModel({
      msg: '添加成功',
      data: res,
    })
  }

  // 删除单位
  async deleteUnit(unit_id) {
    const isExist = await unit.find({ unit_id })
    const isHaveChild = await unit.find({ parent_unit: unit_id })
    const isUsed = await users.find({ unit_id })
    if (
      isExist.length === 0 ||
      isHaveChild.length !== 0 ||
      isUsed.length !== 0
    ) {
      return new ErrorModel({
        msg: '删除失败',
      })
    }
    await unit.deleteOne({ unit_id })
    const res = await this.newUnitTree()
    return new SuccessModel({
      msg: '删除成功',
      data: res,
    })
  }

  // 修改单位
  async updateUnit(unit_id, new_unit_name) {
    await unit.updateOne(
      { unit_id },
      {
        unit_name: new_unit_name,
      }
    )
    const res = await this.newUnitTree()
    return new SuccessModel({
      msg: '更新成功',
      data: res,
    })
  }

  // 查询单位名称
  async lookupUnit(unit_id) {
    if (Number.isNaN(unit_id)) {
      return '无单位'
    }
    const res = await unit.findOne({ unit_id })
    return !(res.unit_name === null || res.unit_name === undefined)
      ? res.unit_name
      : '无单位'
  }

  async getAggregate() {
    try {
      const res = await unit.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'unit_id',
            foreignField: 'unit_id',
            as: 'users',
          },
        },
        {
          $project: {
            _id: 0,
            unit_id: 1,
            unit_name: 1,
            parent_unit: 1,
            users: 1,
          },
        },
      ])
      return res
    } catch (error) {
      return new ErrorModel({
        msg: '获得单位列表失败',
        data: error.message,
      })
    }
  }

  async findRoot(allData, unit_id) {
    const res = allData.filter((item) => item.unit_id == unit_id);
    return res[0]
  }

  async findChild(unit_id, allData) {
    const resArr = allData.filter((item) => item.parent_unit == unit_id)
    return resArr
  }

  async renderTree(root, allData) {
    const children = await this.findChild(root.unit_id, allData)
    if (children.length > 0) {
      root['children'] = children
      for (let i = 0; i < children.length; i++) {
        await this.renderTree(children[i], allData)
      }
    }
  }

  // 重构后的单位列表渲染
  async newUnitTree(unit_id) {
    try {
      if (arguments.length === 0) {
        // 根节点
        unit_id = 1653018366962;
      }
      const allData = await this.getAggregate()
      const root = await this.findRoot(allData, unit_id)
      await this.renderTree(root, allData)
      return new SuccessModel({
        msg: '单位信息处理成功',
        data: root,
      })
    } catch (error) {
      throw new ErrorModel({
        msg: '单位信息处理失败',
        data: e.message,
      })
    }
  }

  // 搜索单位
  async searchUnit(searchValue) {
    const reg = new RegExp(searchValue, 'i')
    const res = await unit.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'unit_id',
          foreignField: 'unit_id',
          as: 'users',
        },
      },
      {
        $match: {
          unit_name: { $regex: reg },
        },
      },
      {
        $project: {
          _id: 0,
          unit_id: 1,
          unit_name: 1,
          parent_unit: 1,
          users: 1,
        },
      },
    ])

    return new SuccessModel({
      msg: '搜索成功',
      data: res,
    })
  }


  async findParent (unit_id) {
    const res = await unit.findOne({ unit_id });
    if (res.parent_unit != 0) {
      return res.parent_unit;
    } else {
      return 0;
    }
  }

  // 生成单位编号
  async createUnitToken(unit_id) {
    let token = `${unit_id}`
    let that = this
    while (1) {
      unit_id = await that.findParent(unit_id);
      if (!unit_id) {
        break
      } else {
        token = String(unit_id) + '-' + token;
      }
    }
    return token
  }

  // 获取全部部门列表
  async getAllUnitData () {
    const res = await unit.find({});
    return res;
  }

  // 计算单位下有多少人
  async getUserById (unit_id) {
    const res = await users.find({ unit_id })
    return new SuccessModel({
      msg: '获取单位用户成功',
      data: res
    })
  }
}

module.exports = new unitService()
