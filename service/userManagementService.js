const users = require('../model/users');
const unit = require('../model/unit');
const role = require('../model/role');
const unitService = require('../service/unitService');

// 用户数据拉取之后放到这里，下次便于取出，无需交互数据库
let userCache = null;
// 一个控制是否将数据重新从数据库拉取的变量
let isNeedUpdateUserCache = false;

let allUnit = null;
let allRole = null;

const inisilize = async () => {
  try {
    allUnit = await unit.find({});
    allRole = await role.find({});
    console.log("拉取用户成功")
  } catch (error) {
    console.log("拉取用户失败")
    await inisilize()
  }
};

// 初始化信息[信息拉取到后台]
inisilize();

/**
 * 添加后台用户
 * @param userInfo  对话框获取的信息
 * @return {Promise<*>} 返回一个
 */
async function addUser (userInfo) {
  try {
    const res = await users.find({account: userInfo.account});
    if (!res) {
      return;
    }
    isNeedUpdateUserCache = true;
    const resq = await users.create({
      ...userInfo,
      activation_status: 1,
    });
    return resq;
  } catch (e) {
    throw e.message
  }
}

/**
 * 获取用户列表
 * 这里是可以进行优化的
 * @return {Promise<*>}
 */
async function getUserList () {
  try {
    if (userCache != null && !isNeedUpdateUserCache) {
      return userCache;
    } else {
      const res = await users.aggregate([
        {
          $lookup: {
            from: 'units',
            localField: 'unit_id',
            foreignField: 'unit_id',
            as: "info1"
          }
        }, {
          $lookup: {
            from: 'roles',
            localField: 'role_id',
            foreignField: 'role_id',
            as: "info2"
          }
        }, {
          $unwind: "$info1"
        }, {
          $unwind: "$info2"
        }, {
          $project: {
            _id: 1,
            user_name: 1,
            account: 1,
            password: 1,
            activation_status: 1,
            unit_id: 1,
            unit_name: '$info1.unit_name',
            role_id: 1,
            role_name: '$info2.role_name'
          }
        }
      ]);
      userCache = res;
      isNeedUpdateUserCache = false;
      return res;
    }
  } catch (e) {
    throw e.message
  }
}

/**
 * 更新用户数据，也包含更新角色
 * @param user_name
 * @param password
 * @param role_name
 * @param account
 * @param new_account
 * @return {Promise<>}
 */
async function updateUser (user_name, password, role_id, account, new_account, unit_id) {
  try {
    isNeedUpdateUserCache = true;
    return await users.updateOne({
      account: account
    }, {
      user_name: user_name,
      password: password,
      role_id: role_id,
      account: new_account,
      unit_id: unit_id
    })
  } catch (e) {
    throw e.message
  }
}

/**
 * 删除角色
 * @param {*} account
 * @returns
 */
async function deleteUser (account) {
  try {
    isNeedUpdateUserCache = true;
    return await users.deleteOne({
      account
    })
  } catch (e) {
    throw e.message
  }
}

/**
 * 查找角色
 * @param {*} searchValue
 * @returns
 */
// TODO (钟卓江=>林凯迪):原型上是对每个属性值分别查，不是混在一起查
async function searchUser (searchValue) {
  const reg = new RegExp(searchValue, 'i')
  try {
    if (userCache == null) {
      await getUserList();
    }
    return userCache.filter(item => {
      return reg.test(item.user_name) || reg.test(item.unit_name) || reg.test(item.role_name);
    });
  } catch (e) {
    throw e.message
  }
}

async function setActivation (account) {
  try {
    isNeedUpdateUserCache = true;
    let res = await users.findOne({
      account
    }, {
      account: 1,
      activation_status: 1
    })
    let tmp = res.activation_status === 1 ? 0 : 1;
    await users.updateOne({
      account
    }, {
      activation_status: tmp
    });
    return await users.findOne({
      account
    }, {
      _id: 1,
      account: 1,
      activation_status: 1
    });
  } catch (e) {
    throw e.message
  }
}

async function findRoleNameAndReturnId (role_name, allRole) {
  for (let item of allUnit) {
    if (item.role_name == role_name) {
      return item.role_id;
    }
  }
  let id = null;
  const roleReg = new RegExp(role_name, 'i');
  // 改进，依据正则，一定程度上可以避免一些粗暴赋予业务员的问题
  allRole.some(item => {
    const roleRegInItem = new RegExp(item.role_name, 'i');
    if (roleRegInItem.test(role_name) || roleReg.test(item.role_name)) {
      id = item.role_id;
      return true;
    }
  });
  return id ? id : 15815115112;
}

async function findUnitNameAndReturnId (unit_name, allUnit) {
  for (let item of allUnit) {
    if (item.unit_name == unit_name) {
      return item.unit_id;
    }
  }
  let id = null;
  const unitReg = new RegExp(unit_name, 'i');
  allUnit.some(item => {
    const unitRegInItem = new RegExp(item.unit_name, 'i');
    if (unitReg.test(item.unit_name) || unitRegInItem.test(unit_name)) {
      id = item.unit_id;
      return true;
    }
  });
  return id ? id : 1653018366962;
}

// 批量添加，注意要添加unit_id
async function batchImportedUser (imported_array) {
  // 目前我们无法捕捉部门和单位的动态变化，在这里我们采用直接全部拉取的方式
  await inisilize()
  try {
    let mapArray = await Promise.all(
      imported_array.map(async item => {
        const role_id = await findRoleNameAndReturnId(item.role_name, allRole);
        const unit_id = await findUnitNameAndReturnId(item.unit_name, allUnit);
        return {
          user_name: item.user_name,
          role_id: role_id,
          unit_id: unit_id,
          account: item.account,
          password: item.password,
          activation_status: 1,
          user_rank: 0,
        }
      })
    );

    // 将 userCache 变成哈希表，实现 O(1) 查询
    const userCacheMap = new Map(userCache.map((item)=>{return [item.account,true]}))
    // 去除重复导入的账号
    mapArray = mapArray.filter((items)=>{
      const reg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
      return (!userCacheMap.has(items.account)) || reg.test(item.account)
    })

    isNeedUpdateUserCache = true;
    return await users.create(mapArray);
  } catch {
    throw e.message;
  }
}

async function getUserById (id) {
  if (!userCache) {
    await getUserList();
  }
  const res = await userCache.filter(item => {
    return item._id == id;
  });

  return res.length > 0 ? res[0] : {
    user_name: '系统',
    account: '系统无id'
  };
}

module.exports = {
  addUser,
  getUserList,
  updateUser,
  deleteUser,
  searchUser,
  setActivation,
  batchImportedUser,
  getUserById
}
