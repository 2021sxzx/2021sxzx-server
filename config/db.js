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
  REDIS_CONFIG ={
    host     : '127.0.0.1',
    port     : '6379',
  }
  MONGO_CONFIG = {
    url       : 'mongodb://127.0.0.1:27017/it666'
  }
}
module.exports = {
  MONGO_CONFIG,
  REDIS_CONFIG
};
