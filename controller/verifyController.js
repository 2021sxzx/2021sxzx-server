const {
    verify
} = require("../service/verifyService")
const { SuccessModel, ErrorModel } = require('../utils/resultModel');

/**
 * 验证token
 * @param token 
 * @returns {Promise<ErrorModel|SuccessModel>}
 */
async function jwtVerify(token) {

    try {
        let data = await verify(token)
        if (data.message) {
            console.log('yes');
            console.log(data);
            return new ErrorModel({ msg: data.message });
        }
        else {
            console.log('nani');
            return new SuccessModel({ msg: '', data: data });
        }
    } catch (e) {
        return new ErrorModel({ msg: e.message })
    }

};

module.exports = {
    jwtVerify
}
