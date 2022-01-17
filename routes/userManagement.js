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

router.get('/v1/getUserList', async (req, res, next) => {

  const data = await returnUserList();
  res.json(data)
})

// router.get('/v1/')

module.exports = router;