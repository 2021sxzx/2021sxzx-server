const express = require('express');
const router = express.Router();
const usersModel = require('../model/users')

const {
  addUser,
  getUserList
} = require('../service/userManagementService')

router.get('/v1/getUserList', async (req, res, next) => {

  let data = await getUserList();
  console.log("data", data)

  res.send({va: 1})
})

module.exports = router;