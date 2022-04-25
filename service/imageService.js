const imageSource = require("../model/imageSource");

/**
 * 图片的获取
 */
 async function getAllImage() {
    let res = await imageSource.find();
    return res;
}
/**
 * 存图片记录进数据库
 */
 async function createImage(data) {
    console.log('success')
    console.log('success')
    console.log('success')
    try {
        if (data.failureName === null) {
            throw new Error('call createSystemFailure error: failure_name is null')
        }
        var res = await imageSource.create({
          img_name: data.name,
          img_path: data.url,
          img_size: data.size,
          img_location: data.location
        })
        console.log('success')
        console.log('success')
        console.log(res)
    } catch (err) {
        throw new Error(err.message)
    }
  }
  
module.exports = {
  getAllImage,
  createImage
};
