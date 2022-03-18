const jwt = require('jsonwebtoken');



/**
 * 验证token
 * @param 
 * @returns {Promise<*>}
 */
/*
async function verify(token) {
    try {

        if (!token) {
            return ({ message: 'You have to be logged in to view this!' });
        }
        else {
            const result = await jwt.verify(token, process.env.JWT_SECRET || 'test');
            if (result) {
                let user = {
                    account: result.account,
                    user_rank: result.user_rank
                };
                return user;
            } else {
                return ({
                    message: 'jwt could not be verified!'
                })
            }
        }

    } catch (e) {
        return e.message;
    }
};
*/
async function verify(req) {
    // 获取token
    const token = req.cookies['auth-token'] || '';
    // 排除不需要授权的路由
    if (req.path === '/api/v1/login') {
        next()
    } else {
        if (!token) {
            res.status(403).send('认证无效，请重新登录。');
        }
        else {
            const result = await jwt.verify(token, process.env.JWT_SECRET || 'test');
            if (result) {
                req.user = {
                    email: result.email,
                    name: result.name
                };
                next();
            } else {
                res.status(403).send('认证无效，请重新登录。');
            }
        }
    }
};

module.exports = {
    verify
}
