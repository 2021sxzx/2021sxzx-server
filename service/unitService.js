const unit = require('../model/unit');
// const { db } = require('../model/users');
const users = require('../model/users');
const roles = require('../model/role');
const { SuccessModel, ErrorModel } = require('../utils/resultModel')

class unitService {

  // 用于将数据库数据拉下，这样无需多次渲染
  constructor () {
    this.allData = null;
    // allUnit: 在做unit查询时，应该要一起做unit数据的保留，以便于找出两个unit_id的父子关系
    this.allUnit = null;
    this.needUpdateData = false;
  }

  // 添加单位
  async addUnit(unit_name, parent_unit) {
    // 使用时间戳来做自增id
    await unit.create({
      unit_name,
      unit_id: Date.now(),
      parent_unit,
    })
    this.needUpdateData = true;
    const res = await this.newUnitTree();
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
    await unit.deleteOne({ unit_id });
    this.needUpdateData = true;
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
    this.needUpdateData = true;
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
      const resq = await unit.aggregate([
        {
          $facet: {
            "aggregateData": [
              {
                $lookup: {
                  from: 'users',
                  localField: 'unit_id',
                  foreignField: 'unit_id',
                  as: 'users',
                }
              }, {
                $project: {
                  _id: 0,
                  unit_id: 1,
                  unit_name: 1,
                  parent_unit: 1,
                  users: 1,
                },
              }
            ],
            "pureData": [
              {
                $match: {}
              }
            ]
          }
        }
      ]);
      this.allUnit = resq[0].pureData;
      // console.log("allUnit", this.allUnit)
      return resq[0].aggregateData;
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
      let allData = null;
      // 在这里，如果发现needUpdateData变为true时，这个时候就会重新拉下所有的数据更新allData
      if (this.allData == null || this.needUpdateData == true) {
        this.allData = await this.getAggregate();
        this.needUpdateData = false;
      }
      allData = this.allData;
      const root = await this.findRoot(allData, unit_id);
      await this.renderTree(root, allData);

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
    try {
      const res = await users.aggregate([
        {
          $lookup: {
            from: 'units',
            localField: 'unit_id',
            foreignField: 'unit_id',
            as: 'agg',
          }
        }, {
          $lookup: {
            from: 'roles',
            localField: 'role_id',
            foreignField: 'role_id',
            as: 'roleInfo'
          }
        }, {
          $unwind: '$agg'
        }, {
          $unwind: '$roleInfo'
        }, {
          $match: {
            unit_id: unit_id
          }
        }, {
          $project: {
            unit_name: '$agg.unit_name',
            _id: 1,
            user_name: 1,
            role_id: 1,
            account: 1,
            password: 1,
            activation_status: 1,
            role_name: '$roleInfo.role_name',
            unit_id: 1
          }
        }
      ]);
      return new SuccessModel({
        msg: '获取单位用户成功',
        data: res
      })
    } catch (error) {
      throw Error(e.message);
    }
  }

  // 计算两个unit_id之间的父子关系
  // 在这里，祖先我们统称为[父]
  // 如果有this.allData, 就没有过多的数据库拉取操作，提高性能
  // 为了方便，我们只判断1是否为2的父亲，不判断1是否为2的子[这么做的考虑，是因为这里不会有超过0.1ms的性能损耗]
  async calculateWhoIsParent (unit_id1, unit_id2) {
    if (this.allUnit == null) {
      await this.getAggregate();
    }
    if (unit_id1 == unit_id2) {
      return true;
    }
    const allUnit = this.allUnit;
    let root2 = allUnit.filter(item => { return item.unit_id == unit_id2 });
    // console.log(typeof(unit_id1), unit_id1)
    // console.log("root2", root2, unit_id2, typeof(unit_id2))
    if (root2.length == 0) {
      return false;
    }
    let parent_unit = null;
    // console.log(root2)


    while (1) {
      // console.log(root2[0])
      // console.log(root2[0].parent_unit, typeof(root2[0].parent_unit));
      // console.log(root2[0].parent_unit == "0")
      // if (typeof root2[0].parent_unit != typeof("153"))
      //   console.log("asd", root2[0])
      // console.log(root2[0]);
      parent_unit = root2[0].parent_unit;
      if (parent_unit == "0") {
        return false;
      } 
      if (parent_unit == unit_id1) {
        return true;
      }
      root2 = allUnit.filter(item => { return item.unit_id == parent_unit });
      // if(root2.length == 0) {
      //   console.log(parent_unit)
      // }
    }

    console.log("ERROR")
    return false;
  }

  // 所有的孩子节点[包括自己]
  async _allChildUnitArr (unit_id) {
    if (this.allUnit == null) {
      await this.getAggregate();
    }

    async function asyncFilter (arr, AsyncCallback) {
      const calFilterArr = await Promise.all(arr.map(AsyncCallback));
      const res = arr.filter((_v, index) => {
        return calFilterArr[index]
      });
      return res;
    }

    // console.log()
    const res = await asyncFilter(this.allUnit, async (item) => {
      const result = await this.calculateWhoIsParent(unit_id, item.unit_id);
      return result;
    })

    const result = res.map(item => {
      return item;
    })

    return result;
  }
}

module.exports = new unitService();