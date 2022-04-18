let MONGO_CONFIG;
let REDIS_CONFIG;

if(process.env.NODE_ENV === 'dev'){
  REDIS_CONFIG = {
    host     : '127.0.0.1',
    port     : '6379',
  }
  MONGO_CONFIG = {
   url       : 'mongodb://127.0.0.1:27017/sxzx'
  }
}else if(process.env.NODE_ENV === 'pro'){
  REDIS_CONFIG = {
    host     : '8.134.73.52',
    port     : '6379',
    password : 'hgc16711'
  }
  MONGO_CONFIG = {
    url      : 'mongodb://root2:Hgc16711@8.134.73.52:27017/sxzx'
  }
}
module.exports = {
  MONGO_CONFIG,
  REDIS_CONFIG
};
