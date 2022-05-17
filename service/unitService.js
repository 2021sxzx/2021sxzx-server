const unit = require('../model/unit');
const unitMapDepartment = require('../model/unitMapDepartment');
const department = require('../model/department');

class unitService {
  // 部门下添加单位
  async addUnit (unit_name, department_name) {
    const isHaveUnitNumber = await unit.find({unit_name});
    const isHaveDepartment = await department.find(department_name);
    const isHaveDepartmentNumber = await unitMapDepartment.find({
      unit_name,
      department_name
    });
    if (isHaveUnitNumber.length <= 0 || isHaveDepartmentNumber.length > 0 || isHaveDepartment.length <= 0) {
      return;
    }

    const res = await unitMapDepartment.create({
      unit_name,
      department_name
    })
    return res;
  }

  // 删除单位
  async deleteUnit (unit_name) {
    const isHaveUnitNumber = await unit.find({unit_name});
    if (isHaveUnitNumber.length <= 0) {
      return;
    }
    await unit.deleteOne({unit_name});
    await unitMapDepartment.deleteMany({unit_name});
  }

  // 修改单位
  async updateUnit (unit_name, new_unit_name) {
    await unit.updateMany({unit_name}, {
      unit_name: new_name
    });
    await unitMapDepartment.updateMany({unit_name}, {
      unit_name: new_unit_name
    });
  }

  // 搜索单位
  async searchUnit (searchValue) {
    const reg = new RegExp(searchValue, 'i')
    const res = await unit.find({
      unit_name: {$regex: reg}
    });
    return res;
  }

  // 修改单位下的处室名称
  async updateDepartmentInUnit (unit_name, department_name, new_department_name) {
    const res = await unit.updateOne({
      unit_name,
    }, {
      department_name: new_department_name
    })
    return res;
  }

  // 根据单位找到所属部门
  async findDepartmentByUnit (unit_name) {
    const res = await unitMapDepartment.find({
      unit_name
    }, {
      department_name: 1
    });
    return res;
  }

  // 单位下面添加部门
  async addDepartmentInUnit (unit_name, department_name) {
    const isExist = await unitMapDepartment.findOne({
      unit_name,
      department_name
    });
    // 不允许重复添加
    if (!isExist) {
      return;
    }
    const res = await unitMapDepartment.create({
      unit_name,
      department_name
    })
    return res;
  }

  // 单位下面删除部门
  async deleteDepartmentInUnit (unit_name, department_name) {
    const isExist = await unitMapDepartment.findOne({
      unit_name,
      department_name
    });
    // 不允许重复删除
    if (!isExist) {
      return;
    }
    const res = await unitMapDepartment.deleteOne({
      unit_name,
      department_name
    })
    return res;
  }

  // 单位下面的部门列表
  async departmentListInUnit () {}

  // 整个单位列表
  async unitList () {
    const res = await unit.find({});
    return res;
  }
}

module.exports = new unitService();