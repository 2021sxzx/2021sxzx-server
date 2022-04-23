const express = require('express');
const router = express.Router();

const {
    jwtVerify
} = require("../controller/verifyController")


function setStatusCode(res, data) {
    if (data.code === 200) {
        res.statusCode = 200
    } else {
        res.statusCode = 404
    }
}

let test = ['login', 'user'];

router.use('/v1/' + test[1], async (req, res, next) => {
    let token = req.cookies['auth-token'] || '';
    let data = await jwtVerify(token);
    setStatusCode(res, data);
    const user = data.data;
    console.log('halo', user);
    console.log(res.statusCode);

    if (data) {
        req.user = {
            account: user.account,
            user_rank: user.user_rank
        };
        next();
    } else {
        res.json({ message: data.message });
    }
});


module.exports = router;
