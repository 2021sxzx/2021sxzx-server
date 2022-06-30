const users = require('../model/users');
const jwt = require('jsonwebtoken');
const {
    jwt_secret,
} = require('../utils/validateJwt');
const {SuccessModel, ErrorModel} = require('../utils/resultModel');

class personalService {
    async getPersonalMsg(token) {
        try {
            const jw = await jwt.verify(token, jwt_secret);
            const account = jw.account;
            const result = await users.aggregate([
                {
                    $lookup: {
                        from: 'roles',
                        localField: 'role_id',
                        foreignField: 'role_id',
                        as: "info1"
                    }
                }, {
                    $lookup: {
                        from: 'units',
                        localField: 'unit_id',
                        foreignField: 'unit_id',
                        as: 'unitInfo'
                    }
                }, {
                    $unwind: '$info1'
                }, {
                    $unwind: '$unitInfo'
                }, {
                    $match: {
                        account: account
                    }
                }, {
                    $project: {
                        account: 1,
                        role_name: '$info1.role_name',
                        user_name: 1,
                        unit_name: '$unitInfo.unit_name',
                        role_id: 1,
                        unit_id: 1,
                    }
                }
            ]);
            return new SuccessModel({
                msg: "查找成功",
                data: result[0]
            });
        } catch (err) {
            if (err.name == 'TokenExpiredError') {//token过期
                let str = {
                    iat: 1,
                    exp: 0,
                    msg: 'token过期'
                }
                return new ErrorModel({
                    msg: str.msg
                });
            } else if (err.name == 'JsonWebTokenError') {//无效的token
                let str = {
                    iat: 1,
                    exp: 0,
                    msg: '无效的token'
                }
                return new ErrorModel({
                    msg: str.msg
                });
            }
        }
    }
}


module.exports = new personalService();
