const departmentMapUser = require('../model/departmentMapUser');
const department = require('../model/department');

class userDepartmentService {
  // 添加处室
  async addDepartment () {

  }

  // 删除处室
  async deleteDepartment () {

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
    return res;
  }

  // 列出所有处室
  async listAllDepartment () {
    const res = await department.find({}, {
      department_name: 1,
      department_id: 1
    });
    return res;
  }

  // 根据账户来查找处室
  async findDepartmentByAccount (account, user_name) {
    const res = await departmentMapUser.findOne({
      account: account,
      user_name: user_name
    });
    return res.department_name;
  }

  // 添加初始处室数据为办公室
  async addUserAndDepartmentInitial (account, user_name) {
    const date = new Date().getTime();
    await departmentMapUser.create({
      account,
      user_name,
      join_time: date,
      department_name: '办公室'
    })
    const res = await departmentMapUser.findOne({
      account,
      user_name
    });
    return res;
  }
}

module.exports = new userDepartmentService();