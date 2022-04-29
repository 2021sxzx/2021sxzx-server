const express = require('express');
const router = express.Router();

const {
  addUserAndReturnList,
  addUserBatchingAndReturnList,
  returnUserList,
  updateUserAndReturnList,
  deleteUserAndReturnList,
  searchUserAndReturnList,
  setActivationAndReturn
} = require('../controller/userManagementController');

const userDepartmentService = require('../service/userDepartmentService');
const departmentMapUser = require('../model/departmentMapUser')

function setStatusCode(res, data) {
  if (data.code === 200) {
      res.statusCode = 200
  } else {
      res.statusCode = 404
  }
}

// 获取用户
router.get('/v1/user', async (req, res, next) => {
  const data = await returnUserList();
  setStatusCode(res, data)
  res.json(data)
})

router.get('/v1/testInfer', async (req, res, next) => {
  const data = await departmentMapUser.findOne({
    account: 'test0422',
    user_name: 'test0422'
  });
  // const data = await userDepartmentService.findDepartmentByAccount('test0422', 'test0422');
  res.json({
    data2: data
  });
})

// 添加用户
router.post('/v1/user', async (req, res, next) => {
  const data = await addUserAndReturnList({
    user_name: req.body.user_name,
    account: req.body.account,
    password: req.body.password,
    role_name: req.body.role_name,
    department_name: req.body.department_name
  })
  setStatusCode(res, data)
  res.json(data)
})

// 修改用户
router.patch('/v1/user', async (req, res, next) => {
  const { user_name, password, role_name, account, new_account } = req.body
  const data = await updateUserAndReturnList(user_name, password, role_name, account, new_account )
  setStatusCode(res, data)
  res.json(data)
})

// 删除用户
router.delete('/v1/user', async (req, res, next) => {
  const { account } = req.body
  const data = await deleteUserAndReturnList(account)
  setStatusCode(res, data)
  res.json(data)
})

// 搜索用户
router.post('/v1/searchUser', async (req, res, next) => {
  const { searchValue } = req.body
  const data = await searchUserAndReturnList(searchValue)
  setStatusCode(res, data)
  res.json(data)
})

// 激活状态
router.post('/v1/setActivation', async function (req, res, next) {
  const {account} = req.body;
  const result = await setActivationAndReturn(account);
  res.json(result);
});

router.post('/v1/batchImportUser', async (req, res, next) => {
  const { imported_array } = req.body;
  const data = await addUserBatchingAndReturnList(imported_array);
  setStatusCode(res, data)
  res.json(data)
})

module.exports = router;