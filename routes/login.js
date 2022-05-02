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
    console.log('login');
    if (data.code === 200) {
        const jwt = data.data.jwt;
        const token = jwt.token;
        const cookie = data.data.cookie;
        res.cookie('auth-token', token, cookie);
        res.json(data);
    } else if (data.code === 404) {
        console.log(data.msg);
        res.status(403).send(data.msg);
    }
});

router.post('/v1/logout', async (req, res) => {
  let logoutData = req.body;
  let data = await postLogout(logoutData);
  setStatusCode(res, data);
  if (data.code === 200) {
    // 设置过期时间，让cookie被清除
    res.clearCookie('auth-token');
    res.json(data);
  } else if (data.code === 404) {
    console.log(data.msg);
    res.status(403).send(data.msg);
  }
})


module.exports = router;
