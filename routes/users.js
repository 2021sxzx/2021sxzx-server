const express = require('express');
const router = express.Router();
// const unitService = require('../service/unitService');
const unit = require('../model/unit');
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
  // const resp = await unitService.addUnit('123', 1);
  // let resqID = parseInt("0x" + String(resp._id).slice(-3));
  // console.log(resqID)
  // console.log(resp);
  // let res1 = Date.now();
  const q = await unit.find({parent_unit: 3});
  res.json(q);
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
