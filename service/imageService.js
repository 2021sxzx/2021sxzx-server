const imageSource = require("../model/imageSource");
const fs=require("fs");
const path=require("path");
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

  
/**
 * 根据图片名字返回图片，供前端使用
 */
 async function getImageHt(name) {
    const filePath = path.join(__dirname,'../public/imgs',name);
    console.log(filePath)
    console.log('------url--------')
    // 给客户端返回一个文件流 type类型
    var stream = fs.createReadStream( filePath );
    var responseData = [];//存储文件流
    if (stream) {//判断状态
        stream.on( 'data', function( chunk ) {
          responseData.push( chunk );
        });
        stream.on( 'end', function() {
           var finalData = Buffer.concat( responseData );
          //  console.log('------------0')
          //  console.log(finalData)
           return finalData;
        });
    }
}

module.exports = {
  getAllImage,
  createImage,
  deleteImage,
  getImageHt
};
