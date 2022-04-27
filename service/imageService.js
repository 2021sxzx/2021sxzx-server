const imageSource = require("../model/imageSource");
const fs=require("fs");
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
        // console.log(res)
    } catch (err) {
        throw new Error(err.message)
    }
  }

  /**
 * 删除数据库里面的图片记录和服务器上的图片文件
 */
 async function deleteImage(data) {
  try {
      // console.log('删除成功')
      // console.log(data.failure_picture)
      data.failure_picture.forEach(item=>{
        console.log(item)
        fs.unlink(item.url, function(err){
          if(err)throw err;
          console.log('删除成功')
        })   
        imageSource.deleteOne({'img_name':item.name}).then((res) =>{
          console.log('success')
        })   
      })
  } catch (err) {
      throw new Error(err.message)
  }
}

  
module.exports = {
  getAllImage,
  createImage,
  deleteImage
};
