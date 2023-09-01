const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const {getAllImage} = require('../service/imageService')
const {IMG_PATH} = require("../config/config");
const {routerProtection}=require("../utils/validateJwt")

/**
 * 获取整个图片列表
 */
router.get('/v1/image',routerProtection, async (req, res, next) => {
    let data = await getAllImage();
    res.json(data)
    return 'res';
})

/**
 * 前台所需的图片的信息
 */
router.get('/v1/logo_image', async (req, res, next) => {
    const getSize = async (name) => {
        const p = path.join(__dirname, '../public/imgs', name)
        var size = 10;
        var test = fs.statSync(p, function (err, stats) {
            if (err) {
                console.log(err)
            } else {
                // console.log('2')
                // console.log('stats')
                // console.log(stats.size)
                size = stats.size
            }
        })//.then(()=>{return size})
        // console.log(test)
        return test.size;
    }
    const data = [
        {name: 'ic_logo', url: IMG_PATH + 'ic_logo.png'},
        {name: 'banner_mb', url: IMG_PATH + 'banner_mb.png'},
        {name: 'banner_pc', url: IMG_PATH + 'banner_pc.jpg'},
        {name: 'ic_delete', url: IMG_PATH + 'ic_delete.png'},
        {name: 'ic_dzjg', url: IMG_PATH + 'ic_dzjg.png'},
        {name: 'ic_fryw', url: IMG_PATH + 'ic_fryw.png'},
        {name: 'ic_gryw', url: IMG_PATH + 'ic_gryw.png'},
        {name: 'ic_jycy', url: IMG_PATH + 'ic_jycy.png'},
        {name: 'ic_ldbz', url: IMG_PATH + 'ic_ldbz.png'},
        {name: 'ic_logo', url: IMG_PATH + 'ic_logo.png'},
        {name: 'ic_placeholder', url: IMG_PATH + 'ic_placeholder.png'},
        {name: 'ic_qrcode', url: IMG_PATH + 'ic_qrcode.png'},
        {name: 'ic_rsrc', url: IMG_PATH + 'ic_rsrc.png'},
        {name: 'ic_search', url: IMG_PATH + 'ic_search.png'},
        {name: 'ic_shbx', url: IMG_PATH + 'ic_shbx.png'},
        {name: 'ic_ygwa', url: IMG_PATH + 'ic_ygwa.png'},
        {name: 'ic_zfwzzc', url: IMG_PATH + 'ic_zfwzzc.png'},
        {name: 'ic_znkf', url: IMG_PATH + 'ic_znkf.png'},
        {name: 'qrcode_app', url: IMG_PATH + 'qrcode_app.jpg'},
        {name: 'qrcode_web', url: IMG_PATH + 'qrcode_web.png'}
    ]
    // data.forEach(item=>{
    //   item.size=getSize1(item.name)
    // })
    for (let i = 0; i < data.length; i++) {
        if (data[i].name === 'banner_pc' || data[i].name === 'qrcode_app') {
            await getSize(data[i].name + '.jpg').then(
                (res) => {
                    data[i].size = res;
                    // console.log('first'+res)
                }
            )
        } else {
            await getSize(data[i].name + '.png').then(
                (res) => {
                    data[i].size = res;
                    // console.log('first'+res)
                }
            )
        }
    }
    if (req.query.imageInfo) {//一个个比对
        const newData = []
        for (let i = 0; i < data.length; i++) {
            if (data[i].size !== req.query.imageInfo[i].size) {
                newData.push(data[i]);
            }
        }
        res.send(newData)
    } else {
        res.send(data)
    }
})

function isFileExisted(path_way) {
    return new Promise((resolve, reject) => {
        fs.access(path_way, (err) => {
            if (err) {
                reject(false);//"不存在"
            } else {
                resolve(true);//"存在"
            }
        })
    })
}

// 返回前端
router.get('/v1/get-picture', async (req, res, next) => {
    // const filePath = path.resolve(__dirname, `../public/images/${req.query.gh}.jpg`);
    // const filePath = path.resolve(__dirname, `../upload/14549661650598157606.jpg`);
    try {
        const filePath = req.query.url;
        console.log(req.query.url);
        console.log("------url--------");
        // console.log(filePath)
        // res.end(req.query);
        // res.end(filePath);
        // 给客户端返回一个文件流 type类型
        res.set("content-type", {png: "image/png", jpg: "image/jpeg"}); //设置返回类型
        const isExist = await isFileExisted(filePath)
        if (isExist) {
            console.log(req.query.url, "文件存在");
            var stream = fs.createReadStream(filePath);
            var responseData = []; //存储文件流
            if (stream) {
                //判断状态
                stream.on("data", function (chunk) {
                    responseData.push(chunk);
                });
                stream.on("end", function () {
                    var finalData = Buffer.concat(responseData);
                    res.write(finalData);
                    res.end();
                });
            }
        } else {
            console.log(req.query.url, "文件不存在");
            res.end()
        }
    } catch (err) {
        res.end();
        return {msg: "获取图片失败", data: err.message, code: 404};
    }
})


// 返回前端
router.get('/v1/get-picture-ht', (req, res, next) => {
    const name = req.query.name;
    const filePath = path.join(__dirname, '../public/imgs', name);
    // 给客户端返回一个文件流 type类型
    res.set('content-type', {"png": "image/png", "jpg": "image/jpeg"});//设置返回类型
    const stream = fs.createReadStream(filePath);
    const responseData = [];//存储文件流
    if (stream) {//判断状态
        stream.on('data', function (chunk) {
            responseData.push(chunk);
        });
        stream.on('end', function () {
            const finalData = Buffer.concat(responseData);
            console.log('+++++0')
            console.log(finalData)
            res.write(finalData);
            res.end();
        });
    }
})
module.exports = router;
