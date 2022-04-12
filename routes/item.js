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

router.get('/v1/getItemStatusScheme', async (req, res, next) => {
    let data = await itemController.getItemStatusScheme()
    setStatusCode(res, data)
    res.json(data)
})

router.get('/v1/getUserRankSchema', async (req, res, next) => {
    let data = await itemController.getUserRankSchema()
    setStatusCode(res, data)
    res.json(data)
})

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

router.post('/v1/getItems', async (req, res, next) => {
    let data = await itemController.getItems(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/createItems', async (req, res, next) => {
    let data = await itemController.createItems(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/deleteItems', async (req, res, next) => {
    let data = await itemController.deleteItems(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/updateItems', async (req, res, next) => {
    let data = await itemController.updateItems(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/changeItemStatus', async (req, res, next) => {
    let data = await itemController.changeItemStatus(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/getRules', async (req, res, next) => {
    let data = await itemController.getRules(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/getRulePaths', async (req, res, next) => {
    let data = await itemController.getRulePaths(req.body)
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

router.post('/v1/updateRules', async (req, res, next) => {
    let data = await itemController.updateRules(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/getRegions', async (req, res, next) => {
    let data = await itemController.getRegions(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/createRegion', async (req, res, next) => {
    let data = await itemController.createRegion(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/deleteRegions', async (req, res, next) => {
    let data = await itemController.deleteRegions(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/updateRegions', async (req, res, next) => {
    let data = await itemController.updateRegions(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/getRegionPaths', async (req, res, next) => {
    let data = await itemController.getRegionPaths(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/getChildRegionsByRuleAndRegion', async (req, res, next) => {
    let data = await itemController.getChildRegionsByRuleAndRegion(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/getItemGuide', async (req, res, next) => {
    let data = await itemController.getItemGuide(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/getItemGuides', async (req, res, next) => {
    let data = await itemController.getItemGuides(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/createItemGuide', async (req, res, next) => {
    let data = await itemController.createItemGuide(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/deleteItemGuides', async (req, res, next) => {
    let data = await itemController.deleteItemGuides(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/updateItemGuide', async (req, res, next) => {
    let data = await itemController.updateItemGuide(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/addAuditAdvise', async (req, res, next) => {
    let data = await itemController.addAuditAdvise(req.body)
    setStatusCode(res, data)
    res.json(data)
})

router.post('/v1/getItemGuideAndAuditAdvises', async (req, res, next) => {
    let data = await itemController.getItemGuideAndAuditAdvises(req.body)
    setStatusCode(res, data)
    res.json(data)
})

module.exports = router