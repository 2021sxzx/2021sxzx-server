const jwt = require('jsonwebtoken');
const rediscl = require('../config/redis');


const jwt_secret = "jwtfanhere";
// token过期时间 设置为10分钟，10分钟后过期，判断登出
const jwt_expiration = 60 * 10;
const jwt_refresh_expiration = 60 * 10;
//访问敏感路由时验证用户
function validate_jwt(req, res, next) {
    if (req.path === '/api/v1/login') {
        next();
    } else {
        let accesstoken = req.cookies.access_token || null;
        let refreshtoken = req.cookies.refresh_token || null;
        // 如果cookies中有token和refreshtoken
        if (accesstoken && refreshtoken) {
            // 验证token
            jwt.verify(accesstoken, jwt_secret, async function (err, decoded) {
                if (err) {
                    // 如果token已经过期，则颁发新的token和refreshtoken
                    if (err.name === "TokenExpiredError") {

                        //获取redis中的token
                        let redis_token = rediscl.get(decoded.account, function (err, val) {
                            return err ? null : val ? val : null;
                        });
                        // 如果redis没找到token或refreshtoken错误
                        if (
                            !redis_token ||
                            redis_token.refresh_token !== refreshtoken
                        ) {
                            // refreshtoken错误，可能是网站受到攻击
                            //reject("Nice try ;-)");
                            res.status(403).send('认证无效，请重新登录。');
                        } else {
                            // 如果refreshtoken过期
                            if (redis_token.expires < new Date()) {
                                // 颁发新的refreshtoken
                                let refresh_token = generate_refresh_token(64);

                                res.cookie("refresh_token", refresh_token, {
                                    // secure: true,
                                    httpOnly: true
                                });
                                let refresh_token_maxage = new Date() + jwt_refresh_expiration;
                                //保存在redis中
                                rediscl.set(
                                    decoded.account,
                                    JSON.stringify({
                                        refresh_token: refresh_token,
                                        expires: refresh_token_maxage
                                    }),
                                    rediscl.print
                                );
                            }
                            // 生成新的token
                            let token = jwt.sign({ account: decoded.uid }, jwt_secret, {
                                expiresIn: jwt_expiration
                            });
                            res.cookie("access_token", token, {
                                // secure: true,
                                httpOnly: true
                            });
                            next();
                        }
                    } else {
                        // 可能token格式出错或其他错误
                        //reject(err);
                        res.status(403).send(err);

                    }
                } else {
                    console.log('halo3');
                    // 验证通过，token没过期
                    /*resolve({
                        res: res,
                        req: req
                    });*/
                    next();

                }
            });
        } else {
            // 如果没有token
            //reject("Token missing.")
            res.status(403).send('认证无效，请重新登录。');

        };
    }
}

//生成 refresh tokens
function generate_refresh_token(len) {
    var text = "";
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}

module.exports = {
    jwt_secret,
    jwt_expiration,
    jwt_refresh_expiration,
    validate_jwt,
    generate_refresh_token
}
