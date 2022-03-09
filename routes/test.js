const express = require('express');
const router = express.Router();

const sideBarDataService = require('../service/sideBarDataService');

router.get('/test', async (req, res, next) => {
  const {role_name} = req.query;
  const e = await sideBarDataService.getSideBarList(role_name)
  console.log(e)
  res.send(e);
})

module.exports = router;