const express = require('express');
const router = express.Router();
const redisClient = require('../config/redis');

const systemMetaService = require('../service/systemMetaService');

var internetAvailable = require("internet-available");

var child = require('child_process');

function setStatusCode(res, data) {
    if (data.code === 200) {
        res.statusCode = 200
    } else {
        res.statusCode = 404
    }
}

router.get('/v1/test', async (req, res) => {
  // 获取数据库中使用者的数目
  // var array = [
  //   [{ "ip": "www.baidu.com", "name": "node2" }],
  //   [{ "ip": "www.csdn.com", "name": "node2" }]
  // ];
  await systemMetaService.networkQualityOfInterface();
  let resqa = [];
  // for (let element of array) {
  //   await p(element, resqa);
  // }
  await res.json(resqa);

  // // 计划在这里再拿一个
  // async function p(element, _resqa) {
  //   new Promise((resolve, rej) => {
  //       console.log(element[0].name);
  //       resolve(element);
  //   }).then((element) => {
  //       console.log('ping -c 10  -w 5 ' + element[0].ip);
  //       var connecting = false;
  //       var fab_cp = child.exec('ping -c 10 -w 5 ' + element[0].ip);
  //       var resqa = [];
  //       fab_cp.stdout.on("data", function(data) {
  //           data = data.toString(data);
  //           resqa.push(data);
  //           if (data.indexOf('0% packet loss') > -1) {
  //               console.log('connecting ok');
  //           } else if (data.indexOf('100% packet loss') > -1) {
  //               console.log('connecting err ~');
  //           } else if (data.indexOf('Destination Host Unreachable') > -1) {
  //               console.log('Destination Host Unreachable ~');
  //           } else {
  //               console.log('connecting Intermittent ~');
  //           }
  //       });
 
  //       fab_cp.on("exit", function(code, signal) {
  //           // console.log('connecting status :', connecting);
  //           // res.json(resqa);
  //           _resqa.push(resqa);
  //           // console.log(_resqa);
  //       });
  //   });
  // }
});

module.exports = router;
