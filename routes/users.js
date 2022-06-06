const express = require('express');
const router = express.Router();
// const unitService = require('../service/unitService');
const unit = require('../model/unit');
const users = require('../model/users');
const role = require('../model/role');
const sideBarData = require('../service/sideBarDataService');
const unitService = require('../service/unitService');
const roleMapPermission = require('../model/roleMapPermission');
// const {
//   addUserAndReturnList,
//   returnUserList,
//   updateUserAndReturnList,
//   deleteUserAndReturnList,
//   searchUserAndReturnList,
//   setActivationAndReturn
// } = require('../controller/userManagementController');

// // 添加用户数据
// router.post('/v1/user', async function (req, res, next) {

// });

router.get('/v1/aq', async function (req, res, next) {
  /*
  // 聚合操作的学习
  // const q = await users.aggregate([
  //   {
  //     $lookup: {
  //       from: 'units',
  //       localField: 'unit_id',
  //       foreignField: 'unit_id',
  //       as: "info"
  //     }
  //   }, {
  //     $match: {
  //       unit_id: 1653018366974
  //     }
  //   }, {
  //     $unwind: "$info"
  //   }, {
  //     $project: {
  //       _id: 0,
  //       user_name: 1,
  //       account: 1,
  //       password: 1,
  //       activation_status: 1,
  //       user_rank: 1,
  //       unit_id: 1,
  //       role_id: 1,
  //       unit_name: '$info.unit_name'
  //     }
  //   }
  // ])
  // const resq = await unitService.newUnitTree();
  // res.json(resq);
  */

  /*
  const resq = await users.aggregate([
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
        _id: 0,
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
  */
  
  const resq = await role.aggregate([
    {
      $lookup: {
        from: 'rolemappermissions',
        localField: 'role_id',
        foreignField: 'role_id',
        as: "info1"
      }
    }, {
      $lookup: {
        from: 'permissions',
        localField: 'permission_identifier',
        foreignField: 'permission_identifier',
        as: "info2"
      }
    }, {
      $project: {
        role_name: 1,
        role_id: 1,
        role_describe: 1,
        permission_identifier: '$info1.permission_identifier',
        info2: 1
      }
    }
  ])
  res.json(resq);
});

// // 更新用户数据
// router.patch('/v1/user', async function (req, res, next) {

// })

// // 删除用户数据
// router.delete('/v1/user', async function (req, res, next) {

// })

// router.post('/v1/searchUser', )


// // 激活状态
// router.post('/v1/setActivation', async function (req, res, next) {
//   const {account} = req.body;
//   const result = await setActivationAndReturn(account);
//   res.json(result);
// });

module.exports = router;
