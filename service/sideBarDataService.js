// 用于返回侧边栏的一个service文件
const sideBar = require('../model/sideBar');
const sideBarMapPermission = require('../model/sideBarMapPermission');
const roleMapPermission = require('../model/roleMapPermission');
const { SuccessModel, ErrorModel } = require('../utils/resultModel');

class sideBarData {

  constructor () {
    // allData 拉取数据库的数据，其中一份放到allData，第二次获取侧边栏就不需要重新访问数据库了
    // 如果有数据库层面的更新，那么重启服务器，该值变为空，之后就会重新拉下新数据到allData
    this.allData = null;
  }

  // 聚合查询数据库中sideBar关联的所有数据
  async listSideBarAndMapPermission (role_id) {
    try {
      // 多表查询
      const res = await sideBarMapPermission.aggregate([
        {
          $lookup: {
            from: 'sidebars',
            localField: 'id',
            foreignField: 'id',
            as: 'obj'
          }
        }, {
          $lookup: {
            from: 'rolemappermissions',
            localField: 'permission_identifier',
            foreignField: 'permission_identifier',
            as: 'obj2'
          }
        }, {
          $unwind: "$obj2"
        }, {
          $unwind: "$obj"
        }, {
          $project: {
            _id: 0,
            id: 1,
            role_id: '$obj2.role_id',
            key: '$obj.key',
            title: '$obj.title',
            parent: '$obj.parent'
          }
        }
      ])
      let deWeight = (arr) => {
        let map = new Map();
        for (let item of arr) {
          const index = item.id + '-' + item.role_id;
          if (!map.has(index)) {
            map.set(index, item);
          }
        }
        return [...map.values()];
      }
      // 备份，注意这里是所有的数据，针对不同的角色也可以无需更新allData
      this.allData = deWeight(res);
      return deWeight(res).filter(item => { return item.role_id == role_id });
    } catch (error) {
      return new ErrorModel({
        msg: "获得侧边栏失败",
        data: error.message
      })
    }
  }

  // 找出孩子节点
  async findChild_new (id, allData) {
    let dataArr = allData.filter(item => { return item.parent == id });
    return dataArr;
  }

  // 递归渲染侧边栏
  async createTree (role_id) {
    try {
      let allData = null;
      if (this.allData == null) {
        allData = await this.listSideBarAndMapPermission(role_id);
      } else {
        allData = this.allData.filter(item => { return item.role_id == role_id });
      }
      
      const that = this;

      async function findIni () {
        const ini = allData.filter(item => { return item.parent === 0 });
        return ini;
      }

      async function renderTree (iniValue) {
        iniValue = await Promise.all(
          iniValue.map(async item => {
            const child = await that.findChild_new(item.id, allData);
            if (child.length > 0) {
              await renderTree(child);
              item['children'] = child;
            }
            return item;
          })
        );
        return iniValue;
      }

      let iniValue = await findIni();
      const sideBar = await renderTree(iniValue);
      return new SuccessModel({
        msg: "获得侧边栏成功",
        data: sideBar.sort((a, b) => a.id - b.id)
      })
    } catch (error) {
      return new ErrorModel({
        msg: "获得侧边栏失败",
        data: error.message
      })
    }
  }
}

module.exports = new sideBarData();