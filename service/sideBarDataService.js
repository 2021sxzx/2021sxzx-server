// 用于返回侧边栏的一个service文件
const sideBar = require('../model/sideBar');
const sideBarMapPermission = require('../model/sideBarMapPermission');
const roleMapPermission = require('../model/roleMapPermission');
const { SuccessModel, ErrorModel } = require('../utils/resultModel');

class sideBarData {

  /***************废弃函数**************************/
  async getSideBarList (role_id) {
    let permissionIdentifier = await roleMapPermission.find({
      role_id: role_id
    });
    const temp = await Promise.all(
      permissionIdentifier.map(async (item) => {
        const re = await sideBarMapPermission.find({
          permission_identifier: item.permission_identifier
        });
        return re;
      })
    );
    
    const permissionList = temp.flat(1);
    let parentArr_temp = await Promise.all(
      permissionList.map(async (item) => {
        const sideBar_ = await sideBar.findOne({
          id: item.id
        })
        return sideBar_;
      })
    );
    let parentArr = parentArr_temp.filter((item, index, self) => {
      return item.parent === 0 && self.findIndex(el => el.id == item.id)===index;
    })

    let childArr = parentArr_temp.filter((item) => {
      return item.parent !== 0;
    })

    let result = await Promise.all(
      parentArr.map(async (item) => {
        let childTree = await this.findChild(item.id);
        if (childTree.children === undefined) {
          return childTree
        }
        childTree.children = childTree.children.filter(item => {
          for (let child of childArr) {
            if (child.id === item.id) {
              return true;
            }
          }
          return false;
        })
        return childTree;
      })
    )

    return new SuccessModel({
      msg: "获得侧边栏成功",
      data: result.sort((a, b) => {
        return a.id - b.id
      })
    })
  }

  async findChild (id) {
    let sideBar_temp = await sideBar.find({
      parent: id
    });
    
    let sideBar_ = await Promise.all(
      sideBar_temp.map(async (item) => {
        let res = await this.onlyReturnChild(item.id)
        // console.log(res);
        return res.length === 0 ? {
          key: item.key,
          title: item.title,
          id: item.id
        } : {
          key: item.key,
          title: item.title,
          id: item.id,
          children: res
        }
      })
    );

    const parent = await sideBar.findOne({
      id: id
    });
    
    return sideBar_.length === 0 ? {
      key: parent.key,
      title: parent.title,
      id: parent.id
    } : {
      key: parent.key,
      title: parent.title,
      id: parent.id,
      children: sideBar_,
    };
  }

  async onlyReturnChild (id) {
    let sideBar_temp = await sideBar.find({
      parent: id
    });
    
    let sideBar_ = await Promise.all(
      sideBar_temp.map(async (item) => {
        return {
          key: item.key,
          title: item.title,
          id: item.id
        }
      })
    );

    return sideBar_.length === 0 ? [] : sideBar_
  }
  /*****************上述为旧接口，可废弃******************************/

  /*******************新接口，解决了数据库的大量查询问题************************************/

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
        }, {
          $match: {
            role_id: role_id
          }
        }
      ])

      let deWeight = (arr) => {
        let map = new Map();
        for (let item of arr) {
          if (!map.has(item.id)) {
            map.set(item.id, item);
          }
        }
        return [...map.values()];
      }

      return deWeight(res);
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
      const allData = await this.listSideBarAndMapPermission(role_id);
      const that = this;

      async function findIni () {
        const ini = allData.filter(item => { return item.parent === 0 });
        return ini;
      }

      async function renderTree (iniValue) {
        // console.log(allData);
        iniValue = await Promise.all(
          iniValue.map(async item => {
            const child = await that.findChild_new(item.id, allData);
            // console.log('child', child)
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