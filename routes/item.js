const express = require('express')
const router = express.Router()
const { getRuleTree, getRegionTree } = require('../controller/itemController')

function setStatusCode(res, data) {
    if (data.code === 200) {
        res.statusCode = 200
    } else {
        res.statusCode = 404
    }
}

router.get('/v1/getRuleTree', async (req, res, next) => {
    let data = await getRuleTree()
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/getRegionTree', async (req, res, next) => {
    let data = await getRegionTree()
    setStatusCode(res, data)
    res.json(data)
})

module.exports = router