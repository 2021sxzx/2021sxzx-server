const department = require('../model/department');
const users = require('../model/users');
const {SuccessModel, ErrorModel} = require('../utils/resultModel');

class userDepartmentService {
  // 添加处室
  async addDepartment (department_name) {
    const res = await department.create({
      department_name,
      department_id: Date.now(),
      subordinate_department: null
    });
    return new SuccessModel({
      msg: '添加成功',
      data: res
    });
  }

  // 批量添加用户的处室
  /*
  async addDepartmentBatching (imported_array) {
    try {
      const date = new Date().getTime();
      let mapArray = imported_array.map(item => {
        return {
          account: item.account,
          user_name: item.user_name,
          join_time: date,
          department_name: item.department_name
        }
      })
      let res = await departmentMapUser.insertMany(mapArray, (err) => { console.log(err) });
      return res;
    } catch (error) {
      throw error.message
    }
  }
  */

  // 删除处室
  async deleteDepartment (department_id) {

    const isEmpty = await users.find({ department_id });
    if (isEmpty.length > 0) {
      return new ErrorModel({
        msg: '有用户使用处室，不允许删除'
      });
    }
    const res = await department.deleteOne({
      department_id
    });
    return new SuccessModel({
      msg: '删除处室成功',
      data: res
    });
  }

  // 更新处室名称
  async updateDepartment (department_id, department_name) {
    await department.updateMany({ department_id }, { department_name });

    const res = await department.find({ department_id }, {
      department_name: 1,
      department_id: 1
    });
    return new SuccessModel({
      msg: '更新处室成功',
      data: res
    });
  }

  // 列出所有处室
  async listAllDepartment () {
    const res = await department.find({}, {
      department_name: 1,
      department_id: 1
    });
    return new SuccessModel({
      msg: '返回数据成功',
      data: res
    });
  }

  // 根据账户来查找部门
  async findDepartmentByAccount (account) {
    const res = await users.findOne({account}, { department_id: 1 });
    let findDepartment = await department.find({department_id: res.department_id});
    return findDepartment === null ? '没有部门' : findDepartment.department_id;
  }

  // 搜索部门
  async searchDepartment (searchValue) {
    if (searchValue == '') {
      searchValue = '.'
    }
    const reg = new RegExp(searchValue, 'i');
    const res = await department.find({
      department_name: {$regex: reg}
    }, {
      department_name: 1,
      department_id: 1
    });
    return new SuccessModel({
      msg: '搜索成功',
      data: res
    });
  }

  async deletePeopleDepartment (account) {
    await users.updateOne({account}, { department_id: null });
    const res = await users.findOne({account});
    return new SuccessModel({
      msg: '删除部门成功',
      data: res
    });
  }
}

module.exports = new userDepartmentService();