const express = require('express')
const router = express.Router()
const {getTel, setTel} = require('../service/systemBasicService')
router.get('/v1/get-tel', async (req, res) => {
  res.send(await getTel())
})
router.post('/v1/set-tel', async ({body: {data}}, res) => {
  res.send(await setTel(data))
})
module.exports = router
