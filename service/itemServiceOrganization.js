const modelRule = require("../model/rule");
const modelRegion = require("../model/region");
const modelTask = require("../model/task");
const modelRemoteCheckLog = require("../model/remoteCheckLog");
const request = require("request");
const fs = require("fs");

const schedule = require("node-schedule");
const mongoose = require("mongoose");
const { MONGO_CONFIG } = require("../config/config"); //数据库的配置信息
const { resolve } = require("path");
const { resourceLimits } = require("worker_threads");

const getToken_Url = "http://api2.gzonline.gov.cn:9090/oauth/token";
const getOrganListByRegionCode_Url =
    "http://api2.gzonline.gov.cn:9090/api/eshore/three/OrganizationService/getOrganListByRegionCode";
const ANNOUNCED = "3"; //已公示的事项的状态码
// const client_id = "basicUser20190821144223063";这是2.0接口用的
const client_id = "20150817140345100400";
// const client_secret = "e9e413e43b8d43cd8e71243cdbec5cd6";
const client_secret = "D674FADAC7424B359C0554F46B04E9A9";
let token = "";
const TYPE = "PARALLEL"; //SERIAL或者PARALLEL
const GZ_REGIONCODE = "440100000000";

/**
 * 发post请求
 * @param {String} url 地址
 * @param {Object} requestData 请求体
 * @returns
 */
function postRequest(url, requestData) {
    return new Promise(async function (resolve) {
        if (token === "") {
            try {
                token = await getToken();
            } catch (err) {
                console.log("GET TOKEN ERROR");
                console.log(err);
                token = "";
                resolve("RETRY");
            }
        }
        const newUrl = url + "?access_token=" + token;
        const option = {
            url: newUrl,
            method: "POST",
            json: true,
            headers: { "content-type": "application/json" },
            form: requestData,
            timeout: 20000,
        };
        request(option, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                resolve(body);
            } else {
                if (!error) {
                    console.log("POST: " + newUrl + " 失败");
                    console.log("请求体: " + JSON.stringify(requestData));
                    console.log(response);
                } else if (error.code !== "ESOCKETTIMEDOUT") {
                    console.log("POST: " + newUrl + " 失败");
                    console.log("请求体: " + JSON.stringify(requestData));
                    console.log(error);
                }
                token = "";
                resolve("RETRY");
            }
        });
    });
}

/**
 * 获取token
 * @returns
 */
function getToken() {
    return new Promise(function (resolve, reject) {
        const url =
            getToken_Url +
            "?client_id=" +
            client_id +
            "&client_secret=" +
            client_secret;
        const option = {
            url: url,
            method: "GET",
            json: true,
            timeout: 20000,
        };
        request(option, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                resolve(body.access_token);
            } else {
                reject(error);
            }
        });
    });
}

async function getOrganListByRegionCode(region_code) {
    try {
        let body = {};
        let retry = 10;
        do {
            body = await postRequest(getOrganListByRegionCode_Url, {
                region_code: region_code,
            });
            retry -= 1;
        } while (body === "RETRY" && retry > 0);
        if (body === "RETRY") {
            console.log(
                "获取" +
                    region_code +
                    "的下级区划信息失败，重试了" +
                    retry +
                    "次"
            );
            return null;
        }
        return body;
    } catch (error) {
        console.log("根据" + region_code + "获取下级区划信息失败");
        throw new Error(error.message);
    }
}


// 获取区划信息
async function mmmain() {
    console.log("开始getToken")
    let token = await getToken()
    console.log(token)
    return ""
    return new Promise(async (resolve, reject) => {
        console.log("开始获取所有的区划");
        const units = {};
        try {
            let regions = await modelRegion.find({}, {});
            console.log("开始获取所有区划对应的实施主体");

            for (let i = 0; i < regions.length; i++) {
                let data = await getOrganListByRegionCode(
                    regions[i].region_code
                );
                //.then是接收正确返回的信息
                console.log(i, regions.length);
                units[regions[i].region_code] = data;

                // break
            }

            resolve(units);
        } catch (err) {
            console.log("err", err);
            reject(err);
        }
    });
}


// 获取事项指南的信息
// async function main() {
//     return new Promise(async (resolve, reject) => {
//         console.log("开始获取所有的事项指南信息");
//         const units = {};
//         try {
//             let regions = await modelRegion.find({}, {});
//             console.log("开始获取所有区划对应的实施主体");

//             for (let i = 0; i < regions.length; i++) {
//                 let data = await getOrganListByRegionCode(
//                     regions[i].region_code
//                 );
//                 //.then是接收正确返回的信息
//                 console.log(i, regions.length);
//                 units[regions[i].region_code] = data;

//                 // break
//             }

//             resolve(units);
//         } catch (err) {
//             console.log("err", err);
//             reject(err);
//         }
//     });
// }


// 异步连接 MongoDB
mongoose
    .connect("mongodb://root2:Hgc16711@10.196.133.5:27017/sxzx", {
        ssl: true,
        sslValidate: false,
        sslCA: "./config/mongodbSSL/ca.pem",
        sslKey: "./config/mongodbSSL/client.key",
        sslCert: "./config/mongodbSSL/client.crt",
    })
    .then(() => {
        console.log("MongoDB 连接成功");
    })
    .catch((err) => {
        console.log("MongoDB 连接失败。错误信息如下：");
        consoe.dir(err);
    });


var res = mmmain()
    .then((res) => {
        const data = JSON.stringify(res);

        // write JSON string to a file
        fs.writeFile("../user.json", data, (err) => {
            if (err) {
                throw err;
            }
            console.log("JSON data is saved.");
        });
    })
    .catch((err) => {
        // .catch 返回报错信息
        console.log(err);
    });
