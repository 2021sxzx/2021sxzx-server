const express = require('express');
const router = express.Router();

const personalService = require("../service/personalService");

function setStatusCode(res, data) {
    if (data.code === 200) {
        res.statusCode = 200
    } else {
        res.statusCode = 404
    }
}

router.get('/v1/test', async (req, res) => {
  await personalService.getPersonalMsg("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50IjoiYWNjb3VudCIsImlhdCI6MTY1NTI2NDc2MCwiZXhwIjoxNjU1MjY1MzYwfQ._qsVsrq8XV4V53FJ1v_51uKQseuri9MVbCwPX50RdUo");
  res.json(1);
});

module.exports = router;
