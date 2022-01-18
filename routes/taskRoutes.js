const express = require('express');
const router = express.Router();
const taskModel = require("../model/task")
function setStatusCode(res,data) {
  if(data.code === 200) {
    res.statusCode = 200
  }else {
    res.statusCode = 404
  }
}

router.get('/v1/taskResult/:task_code',async (req,res,next) => {
  try {
    let task_code = req.params.task_code
    let data = await taskModel.find({task_code: task_code})
    if(data) {
      data.code = 200
    } else {
      data.code = 404
    }
    setStatusCode(res, data)
    res.json(data)
  } catch (e) {
    res.statusCode = 404
    res.json(e.message)
  }
})
module.exports = router;
