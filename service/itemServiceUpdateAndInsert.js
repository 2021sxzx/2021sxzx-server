
const modelRemoteCheckLog = require("../model/remoteCheckLog");
const mongoose = require("mongoose");
const itemController = require("../controller/itemController")
const request = require("request");
const modelTask = require("../model/task");


const getToken_Url = "http://api2.gzonline.gov.cn:9090/oauth/token";
const getChildRegionList_Url =
    "http://api2.gzonline.gov.cn:9090/api/eshore/three/OrganizationService/getChildRegionList";
const getOrganListByRegionCode_Url =
    "http://api2.gzonline.gov.cn:9090/api/eshore/three/OrganizationService/getOrganListByRegionCode";
const listItemBasicByOrg_Url =
    "http://api2.gzonline.gov.cn:9090/api/eshore/three/power/listItemBasicByOrg";
const getItem_Url =
    "http://api2.gzonline.gov.cn:9090/api/eshore/three/power/getItem";
const ANNOUNCED = "3"; //已公示的事项的状态码
// const client_id = "basicUser20190821144223063";这是2.0接口用的
const client_id = "20150817140345100400";
// const client_secret = "e9e413e43b8d43cd8e71243cdbec5cd6";
const client_secret = "D674FADAC7424B359C0554F46B04E9A9";
let token = "";
const TYPE = "PARALLEL"; //SERIAL或者PARALLEL
const GZ_REGIONCODE = "440100000000";

function getToken() {
    return new Promise(function (resolve, reject) {
        const url =
            getToken_Url +
            "?client_id=" +
            client_id +
            "&client_secret=" +
            client_secret;
        console.log(url);
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


/**
 * 发post请求
 * @param {String} url 地址
 * @param {Object} requestData 请求体
 * @returns
 */
function postRequest(url, requestData) {
    return new Promise(async function (resolve) {
        if (token === '') {
            try {
                token = await getToken()
            } catch (err) {
                console.log('GET TOKEN ERROR')
                token = ''
                resolve('RETRY')
            }
        }
        const newUrl = url + '?access_token=' + token;
        const option = {
            url: newUrl,
            method: 'POST',
            json: true,
            headers: {'content-type': 'application/json'},
            form: requestData,
            timeout: 20000
        }
        request(option, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                resolve(body)
            } else {
                if (!error) {
                    console.log('POST: ' + newUrl + ' 失败')
                    console.log('请求体: ' + JSON.stringify(requestData))
                    console.log(response)
                } else if (error.code !== 'ESOCKETTIMEDOUT') {
                    console.log('POST: ' + newUrl + ' 失败')
                    console.log('请求体: ' + JSON.stringify(requestData))
                    console.log(error)
                }
                token = ''
                resolve('RETRY')
            }
        })
    })
}

async function getItemBySituationCode(situation_code) {
    let body = {};
    let retry = 10;
    try {
        do {
            body = await postRequest(getItem_Url, {
                situation_code: situation_code,
            });
            retry -= 1;
        } while (body === "RETRY" && retry > 0);
        if (body === "RETRY") {
            console.log(
                "获取" +
                    situation_code +
                    "的办理项详细信息失败，重试了" +
                    retry +
                    "次"
            );
            return null;
        }
        if (!body.data) {
            console.log(
                "请求" +
                    situation_code +
                    "情形（办理项）详细信息有问题，返回的body如下："
            );
            console.log(body);
            return null;
        }
        if (
            body.data.state !== ANNOUNCED ||
            body.data.service_item_type === "9" ||
            body.data.service_item_type === "13" ||
            body.data.service_item_type === "14"
        ) {
            return null;
        } else {
            return body.data;
        }
    } catch (error) {
        console.log("根据" + situation_code + "获取情形（办理项）详细信息失败");
        console.log(body);
        throw new Error(error.message);
    }
}

/**
 * 根据事项编码/情形（办理项）编码获取事项/情形（办理项）详细信息
 * @param {String} code 事项编码
 * @returns
 */
async function getItemByCode(code) {
    let body = {}
    let retry = 10
    try {
        do {
            body = await postRequest(getItem_Url, {
                code: code
            })
            retry -= 1
        } while (body === 'RETRY' && retry > 0)

        if (body === 'RETRY') {
            console.log('获取' + code + '的事项详细信息失败，重试了' + retry + '次')
            return null
        }

        if (!body.data) {
            console.log('请求' + code + '事项详细信息有问题，返回的body如下：')
            console.log(body)
            return null
        }

        if (body.data.state !== ANNOUNCED || body.data.service_item_type === '9' || body.data.service_item_type === '13' || body.data.service_item_type === '14') {
            return null
        } else {
            return body.data
        }
    } catch (error) {
        console.log('根据' + code + '获取事项详细信息失败')
        throw new Error(error.message)
    }
}

/**
 * 根据事项的实施编码获取事项/情形（办理项）详细信息
 * @param {String} carry_out_code 实施编码
 * @returns
 */
async function getItem(carry_out_code) {
    try {
        const value = await getItemByCode(carry_out_code)
        //如果事项没有公示就返回空数组
        if (value === null) {
            return []
        }
        //如果事项有若干个办理项，就返回办理项数组
        if (value.situation.length > 0) {
            let situations = []
            //并行
            if (TYPE === 'PARALLEL') {
                const promiseList = []
                for (let i = 0, len = value.situation.length; i < len; i++) {
                    promiseList.push(getItemBySituationCode(value.situation[i].situation_code))
                }
                situations = await Promise.all(promiseList)
            }
                //------
            //串行
            else {
                for (let i = 0, len = value.situation.length; i < len; i++) {
                    let s = await getItemBySituationCode(value.situation[i].situation_code)
                    situations.push(s)
                }
            }
            //------
            const result = []
            for (let i = 0, len = situations.length; i < len; i++) {
                if (situations[i] !== null) {
                    result.push(situations[i])
                }
            }
            return result
        }
        //如果事项没有办理项，就返回他自己
        return [value]
    } catch (error) {
        console.log('根据' + carry_out_code + '获取事项/情形（办理项）详细信息失败')
        throw new Error(error.message)
    }
}


async function insertAndUpdateAllItems(regions, time) {
    // let remoteCheckLog = modelRemoteCheckLog.find({})

    const fs = require('fs');
    let task_code_list = []
    try {
        // read contents of the file
        const data = fs.readFileSync('data/district02.txt', 'UTF-8');

        // split the contents by new line
        const lines = data.split(/\r?\n/);

        // print all lines
        lines.forEach((line) => {
            if(line != "")
                task_code_list.push(line)
        });
    } catch (err) {
        console.error(err);
    }

    // console.log(task_code_list)
    // return 0
    for (let j = 0; j < task_code_list.length; j++) {
        console.log(task_code_list[j]);
        // break
        detail = await getItem(task_code_list[j]);
        if (detail == null || detail.length == 0)
            continue;

        let r = "";
        for (let i = 0, len = detail.length; i < len; i++) {
            detail[i].user_id = "6237ed0e0842000062005753";
            detail[i].task_code = detail[i]["carry_out_code"];
            detail[i].new_task_code = detail[i]["carry_out_code"];
            detail[i].task_name = detail[i]["name"];

            let task = await modelTask.exists({ task_code: detail[i].task_code });
            if (task === false) {
                r = await itemController.createItemGuide(detail[i]);
                return 0
            } else {
                console.log("暂不更新")
                continue
                r = await itemController.updateItemGuide(detail[j]);
            }
            console.log(r);
        }
        // console.log(inRemoteNinLocal[j]);
        // console.log("完成数据更新")
        // break
    }

}

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
        console.dir(err);
    });




function setCheckJobRule() {
    insertAndUpdateAllItems()
        .then(() => {
            console.log("完成checkAllRegionsItems");
        })
        .catch((err) => {
            console.log("检查区划事项失败");
            console.log(err);
        });
}

setCheckJobRule()
