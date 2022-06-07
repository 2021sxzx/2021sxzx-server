const express = require('express');
const router = express.Router();

const {
    postLogin,
    postLogout
} = require("../controller/loginController")

router.post('/v1/login', async (req, res) => {
    let loginData = req.body;
    let data = await postLogin(loginData);
    if (data.code === 200) {
        const jwt = data.data.jwt;
        const token = jwt.token;
        
        // 配置登录响应头，防止XSS和CSRF
        res.cookie('auth-token', token, {
          httpOnly: true,
          sameSite: 'Lax'
        });

        
        res.cookie('unit_id', data.data.unit_id, {
          httpOnly: true,
          sameSite: 'Lax'
        });

        res.cookie('role_id', data.data.role_id, {
          httpOnly: true,
          sameSite: 'Lax'
        });
        res.json(data);
    } else {
        res.status(404).json(data);
    }
});

router.post('/v1/logout', async (req, res) => {
  let logoutData = req.body;
  let data = await postLogout(logoutData);
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
