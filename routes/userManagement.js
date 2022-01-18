const express = require('express');
const router = express.Router();
const usersModel = require('../model/users')

const {
  addUserAndReturnList,
  returnUserList,
  updateUserAndReturnList,
  deleteUserAndReturnList,
  searchUserAndReturnList
} = require('../controller/userManagementController')

router.get('/v1/user/list', async (req, res, next) => {
  const data = await returnUserList();
  res.json(data)
})

router.post('/v1/user', async (req, res, next) => {
  const data = await addUserAndReturnList({
    user_name: req.body.user_name,
    account: req.body.account,
    password: req.body.password,
    role_name: req.body.role_name
  })
  res.json(data)
})

// 修改用户
router.patch('/v1/user', async (req, res, next) => {
  const { user_name, password, role_name, account } = req.query
  const data = await updateUserAndReturnList(user_name, password, role_name, account)
  res.json(data)
})

// 删除用户
router.delete('/v1/user', async (req, res, next) => {
  const { account } = req.query
  const data = await deleteUserAndReturnList(account)
  res.json(data)
})

router.get('/v1/search', async (req, res, next) => {
  const { searchValue } = req.query
  const data = await searchUserAndReturnList(searchValue)
})

module.exports = router;