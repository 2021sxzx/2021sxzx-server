// 用于返回侧边栏的一个service文件
const sideBar = require('../model/sideBar');
const sideBarMapPermission = require('../model/sideBarMapPermission');
const roleMapPermission = require('../model/roleMapPermission');
const { SuccessModel } = require('../utils/resultModel');

class sideBarData {
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
        // console.log("childTree", childTree)
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
}

module.exports = new sideBarData();