const express = require('express');
const router = express.Router();

const {
    postLogin,
    postLogout
} = require("../controller/loginController")


function setStatusCode(res, data) {
    if (data.code === 200) {
        res.statusCode = 200
    } else {
        res.statusCode = 404
    }
}


router.post('/v1/login', async (req, res) => {
    let loginData = req.body;
    let data = await postLogin(loginData);
    setStatusCode(res, data);
    if (data.code == 200) {
        const jwt = data.data.jwt;
        const token = jwt.token;
        const refresh_token = data.data.refresh_token;
        const cookie = data.data.cookie;
        res.cookie('access_token', token, cookie);
        res.cookie("refresh_token", refresh_token, {
            // secure: true,
            httpOnly: true
        });
        res.json(data);
    } else if (data.code == 404) {
        res.status(403).send(data.msg);

    }

});

router.post('/v1/logout', async (req, res, next) => {
    let logoutData = req.body;
    let data = await postLogout(logoutData);



    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    //res.redirect("/v1/home");
    res.json(data);

});


module.exports = router;
