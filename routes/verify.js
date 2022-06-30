const express = require('express');
const router = express.Router();

function setStatusCode(res, data) {
    if (data.code === 200) {
        res.statusCode = 200
    } else {
        res.statusCode = 404
    }
}

router.get('/v1/test', async (req, res) => {
  res.json(1);
});

module.exports = router;
