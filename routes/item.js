const express = require('express')
const router = express.Router()
const itemController = require('../controller/itemController')

function setStatusCode(res, data) {
    if (data.code === 200) {
        res.statusCode = 200
    } else {
        res.statusCode = 404
    }
}

router.get('/v1/getRuleTree', async (req, res, next) => {
    let data = await itemController.getRuleTree()
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/getRegionTree', async (req, res, next) => {
    let data = await itemController.getRegionTree()
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/getItemByUniId', async (req, res, next) => {
    let data = await itemController.getItemByUniId(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/getItems', async (req, res, next) => {
    let data = await itemController.getItems(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/getItemsByRuleId', async (req, res, next) => {
    let data = await itemController.getItemsByRuleId(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/getItemsByRegionId', async (req, res, next) => {
    let data = await itemController.getItemsByRegionId(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/createRules', async (req, res, next) => {
    let data = await itemController.createRules(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/deleteRules', async (req, res, next) => {
    let data = await itemController.deleteRules(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/getItemRules', async (req, res, next) => {
    let data = await itemController.getItemRules(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/createItemRules', async (req, res, next) => {
    let data = await itemController.createItemRules(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/deleteItemRules', async (req, res, next) => {
    let data = await itemController.deleteItemRules(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/getRulePath', async (req, res, next) => {
    let data = await itemController.getRulePath(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/getItemRulePath', async (req, res, next) => {
    let data = await itemController.getItemRulePath(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/getRules', async (req, res, next) => {
    let data = await itemController.getRules(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/getAllItemsByRegionId', async (req, res, next) => {
    let data = await itemController.getAllItemsByRegionId(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/getItemGuide', async (req, res, next) => {
    let data = await itemController.getItemGuide(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/getRegionPath', async (req, res, next) => {
    let data = await itemController.getRegionPath(req.body)
    setStatusCode(res, data)
    res.json(data)
})

module.exports = router