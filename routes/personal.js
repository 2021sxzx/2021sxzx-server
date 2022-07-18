const express = require('express');
const router = express.Router();
const modelUsers = require('../model/users')
const personalController = require('../controller/personalController');
const {ErrorModel} = require('../utils/resultModel');
function wrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      throw new ErrorModel({
        msg: "个人信息处理失败",
        data: e.message
      });
    }
  };
}


router.get('/v1/personal', wrap(personalController.getTopBarData));
//新增的发送验证码
router.post('/v2/modifyPwd',(req,res)=>{
  var updataUser = {'account':req.body.account}
  var updatePwd = {'password':req.body.pwd}
  modelUsers.updateOne(updataUser,updatePwd,function(err,res){
    if(err){
        console.log('更新失败：',err);
    }else{
        console.log("更新密码成功:",res);
    }
  })

  console.log("req.body:",req.body)
  res.end()
})

module.exports = router;