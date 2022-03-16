const express = require('express');
const router = express.Router();

const {
    postLogin
} = require("../controller/loginController")


function setStatusCode(res, data) {
    if (data.code === 200) {
        res.statusCode = 200
    } else {
        res.statusCode = 404
    }
}


router.post('/v1/login', async (req, res, next) => {
    let loginData = req.body;
    let data = await postLogin(loginData);
    setStatusCode(res, data);
    res.cookie('auth-token', data.data[1].token, data.data[0]);
    res.json(data.data[1]);
});


module.exports = router;
