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
    console.log('login');
    if (data.code == 200) {
        const jwt = data.data.jwt;
        const token = jwt.token;
        const cookie = data.data.cookie;
        res.cookie('auth-token', token, cookie);
        res.json(data);
    } else if (data.code == 404) {
        console.log(data.msg);
        res.status(403).send(data.msg);

    }

});


module.exports = router;
