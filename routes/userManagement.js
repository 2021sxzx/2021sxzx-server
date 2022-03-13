const express = require('express');
const router = express.Router();

const {
  addUserAndReturnList,
  returnUserList,
  updateUserAndReturnList,
  deleteUserAndReturnList,
  searchUserAndReturnList
} = require('../controller/userManagementController')

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

// 添加用户
router.post('/v1/user', async (req, res, next) => {
  const data = await addUserAndReturnList({
    user_name: req.body.user_name,
    account: req.body.account,
    password: req.body.password,
    role_name: req.body.role_name,
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


module.exports = router;