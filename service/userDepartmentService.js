const departmentMapUser = require('../model/departmentMapUser');
const department = require('../model/department');
const { users } = require('systeminformation');
const {SuccessModel, ErrorModel} = require('../utils/resultModel');

class userDepartmentService {
  // 添加处室
  async addDepartment (department_name) {
    await department.create({
      department_name,
      department_id: 0,
      subordinate_department: null
    });
    const res = await department.findOne({
      department_name
    }, {
      department_name: 1
    })
    return new SuccessModel({
      msg: '添加成功',
      data: res
    });
  }

  // 批量添加用户的处室
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

  // 删除处室
  async deleteDepartment (department_name) {
    const isEmpty = await departmentMapUser.findOne({
      department_name
    });
    if (!!isEmpty) {
      return;
    }
    const res = await department.deleteOne({
      department_name
    });
    return new SuccessModel({
      msg: '删除处室成功',
      data: res
    });
  }

  // 更新处室名称
  async updateDepartment (department_name, new_department_name) {
    await department.updateMany({
      department_name: department_name
    }, {
      department_name: new_department_name
    });

    await departmentMapUser.updateMany({
      department_name: department_name
    }, {
      department_name: new_department_name
    });
    const res = await department.find({
      department_name: new_department_name
    }, {
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
      department_name: 1
    });
    return new SuccessModel({
      msg: '返回数据成功',
      data: res
    });
  }

  // 根据账户来查找处室
  async findDepartmentByAccount (account, user_name) {
    const res = await departmentMapUser.findOne({
      account: account,
      user_name: user_name
    });
    return res === null ? '没有处室' : res.department_name;
  }

  async isInDepartment (department_name) {
    const res = await department.findOne({
      department_name: department_name
    });
    if (!res) {
      return false;
    }
    return true;
  }

  // 添加初始处室数据若为空或者不合法，则默认为办公室
  async addUserAndDepartmentInitial (account, user_name, department_name) {
    const date = new Date().getTime();
    let isInDepartment = null;
    const resq = await department.findOne({
      department_name: department_name
    });
    if (!resq) {
      isInDepartment = false;
    } else {
      isInDepartment = true;
    }
    department_name = department_name !== undefined && isInDepartment === true ? department_name : '办公室';
    await departmentMapUser.create({
      account,
      user_name,
      join_time: date,
      department_name
    });
    const res = await departmentMapUser.findOne({
      account,
      user_name
    });
    return res;
  }

  async deleteUserAndDepartment (account) {
    const res = await departmentMapUser.deleteOne({
      account
    })
    return res;
  }

  async searchDepartment (searchValue) {
    const reg = new RegExp(searchValue, 'i');
    const res = await department.find({
      department_name: {$regex: reg}
    }, {
      department_name: 1
    });
    return new SuccessModel({
      msg: '搜索成功',
      data: res
    });
  }
}

module.exports = new userDepartmentService();