const express = require('express');
const router = express.Router();
// const unitService = require('../service/unitService');
const unit = require('../model/unit');
const users = require('../model/users');
const sideBarData = require('../service/sideBarDataService')
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

// // 返回用户列表
router.get('/v1/aq', async function (req, res, next) {

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
  // const resq = await sideBarData.listSideBarAndMapPermixsion(15815115112);
  // console.log(resq);
  // console.log(q);
  const resq = await sideBarData.createTree(15815115114);
  res.json(resq);
})

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
