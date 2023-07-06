var mongoose = require('mongoose');
const redis = require("redis");
const schedule = 100; 
// oplog.rs表的定义
const oplogSchema = new mongoose.Schema({
    ts: {      
        type: String,
        required: true
    },
    op: {    // 规则项名称
        type: String,
        required: true
    },
    ns: {     // 父节点的id名称
        type: String,
        required: true
    },
    o: {
        type: mongoose.Schema.Types.Mixed
    },
    o2: {  
        type: mongoose.Schema.Types.Mixed
    },
    wall: {  
        type: Date
    }
})
// rule表的定义
const ruleSchema = new mongoose.Schema({
    rule_id: {      // 规则项id
        type: String,
        required: true,
        index: {
            unique: true,
            sparse: true
        }
    },
    rule_name: {    // 规则项名称
        type: String,
        required: true
    },
    parentId: {     // 父节点的id名称
        type: String,
        default: ''
    },
    children: {
        type: [{
            type: String
        }],
        default: []
    },
    create_time: {  // 创建时间
        type: Number,
        default: Date.now()
    },
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    }
})
const taskSchema = new mongoose.Schema({
    create_time: {            //事项指南创建时间
        type: Number,
        default: Date.now(),
    },
    task_status: {            //事项指南状态，0是未绑定规则，1是已绑定规则
        type: Number,
        default: 0,
    },
    task_code: {              //事项指南编码
        type: String,
        required: true,
        index: {
            unique: true,
            sparse: true
        }
    },
    task_name: {              //事项指南名称
        type: String,
        required: true,
    },
    service_agent_name: { // 实施主体名称
        type: String,
        required: true,
    },
    service_agent_code: { // 实施主体编码
        type: String,
        required: true,
    },
    // accept_time: String,            //受理时限，以&&分隔，第一个数字表示受理时限，第二个数字表示受理时限单位
    wsyy: {                   //已开通的网上办理方式，以&&分隔，数字表示方式，"-"后面是相应的地址
        type: String,
        default: '',
    },
    service_object_type: {    //服务对象类型
        type: String,
        // required: true,
    },
    conditions: {             //办理条件（申请条件）
        type: String,
        default: '',
    },
    legal_basis: {            //法律法规依据
        type: [{
            name: {
                type: String,
                // required: true,  //不是必须的
            }
        }],
        default: [],
    },
    // approval_conditions: Array,     //审批条件
    legal_period: {           //法定期限
        type: Number,
        // required: true,
    },
    legal_period_type: {      //法定期限单位
        type: String,
        // required: true,
    },
    promised_period: {        //承诺期限
        type: Number,
        // required: true,
    },
    promised_period_type: {   //承诺期限单位
        type: String,
        // required: true,
    },
    // apply_time: String,             //申请时限
    // accept_time_sp: String,         //办理时限说明
    windows: {                //办事窗口
        type: [{
            name: {           //窗口名称
                type: String,
                // required: true,
            },
            phone: {          //电话
                type: String,
                // required: true,
            },
            address: {        //地址
                type: String,
                // required: true
            },
            office_hour: {    //办公时间
                type: String,
                // required: true
            }
        }],
        default: [],
    },
    apply_content: {          //申请内容
        type: String,
        default: '',
    },
    // serviceCheckConsult: Object,    //审批咨询
    // acceptType: String,             //受理形式
    ckbllc: {                 //窗口办理流程说明
        type: String,
        default: '',
    },
    wsbllc: {                 //网上办理流程说明
        type: String,
        default: '',
    },
    mobile_applt_website: {   //移动端办理地址
        type: String,
        default: '',
    },
    // link_way: String,               //咨询方式
    submit_documents: {       //提交材料
        type: [{
            materials_name: {
                type: String,
                // required: true,
            },
            origin: {
                type: Number,
                // required: true
            },
            copy: {
                type: Number,
                // required: true
            },
            material_form: {
                type: String,
                // required: true
            },
            page_format: {
                type: String,
                // required: false
            },
            material_necessity: {
                type: String,
                // required: true
            },
            material_type: {
                type: String,
                // required: true
            },
            submissionrequired: {
                type: String,
                // required: true
            },
        }],
        default: [],
    },
    zxpt: {                   //咨询平台
        type: String,
        default: '',
    },
    qr_code: {                //二维码
        type: String,
        default: '',
    },
    zzzd: {                   //自助终端
        type: String,
        default: '',
    },
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    }
})

REDIS_CONFIG = {
    host: '10.196.133.5',
    port: '6379',
    password: 'hgc16711',
}
MONGO_CONFIG = {
    local_url: 'mongodb://root2:Hgc16711@10.196.133.5:27017/local',
    sxzx_url: 'mongodb://root2:Hgc16711@10.196.133.5:27017/sxzx',
}

// REDIS_CONFIG = {
//     host: '8.134.73.52',
//     port: '6379',
//     password: 'hgc16711',
// }
// MONGO_CONFIG = {
//     local_url: 'mongodb://8.134.73.52:27017/local',
//     sxzx_url: 'mongodb://8.134.73.52:27017/sxzx',
// }

let localDBssl = {
    ssl: true,
    sslValidate: false,
    sslCA: '../config/mongodbSSL/ca.pem',
    sslKey: '../config/mongodbSSL/client.key',
    sslCert: '../config/mongodbSSL/client.crt',
}

let sxzxDBssl = {
    ssl: true,
    sslValidate: false,
    sslCA: '../config/mongodbSSL/ca.pem',
    sslKey: '../config/mongodbSSL/client.key',
    sslCert: '../config/mongodbSSL/client.crt',
}

// 开发环境配置
if(process.env.NODE_ENV === 'local') {
    REDIS_CONFIG.host = '127.0.0.1'
    REDIS_CONFIG.port = '6379',
    REDIS_CONFIG.password = ''

    MONGO_CONFIG.local_url = 'mongodb://127.0.0.1:27017/local'
    MONGO_CONFIG.sxzx_url = 'mongodb://127.0.0.1:27017/sxzx'

    localDBssl = {}
    sxzxDBssl = {}
}


const maxRedisClient = 10;
const redisClients = [];
var localDB,sxzxDB;

function getRedisCli(redis_id) {
    return redisClients[redis_id];
}
function getlocalDB() {
    return localDB;
}
function getSxzxDB() {
    return sxzxDB;
}

async function init() {
    promiseList = [];
    for (i = 0; i < maxRedisClient; i++){
        cli = redis.createClient({
            socket: {
                port: REDIS_CONFIG.port,
                host: REDIS_CONFIG.host
            },
            password: REDIS_CONFIG.password,
        });
        promiseList.push(cli.connect().then(() => {
        }).catch((err) => {
            console.log('Redis'+i+'连接失败。错误信息如下：')
            console.dir(err)
        }))
        redisClients.push(cli)
    }
    await Promise.all(promiseList);
    for (i = 0; i < maxRedisClient; i++){
        redisClients[i].select(i);
    }
    console.log('redis连接成功')
    // redisClients[7].set('{"rule_name":{"$ne":"null"},"parentId":{"$in":["36"]},"create_time":{"$gte":0,"$lte":9999999999999}}','22',(err)=>{console.log(err)})
    localDB = await mongoose.createConnection(MONGO_CONFIG.local_url, localDBssl, err => {
        if (!err) {
            console.log('localDB连接成功')
        } else {
            console.log('localDB 连接失败。错误信息如下：')
            console.dir(err)
        }
    });
    await localDB.model('oplog.rs', oplogSchema)

    sxzxDB = await mongoose.createConnection(MONGO_CONFIG.sxzx_url, sxzxDBssl, err => {
        if (!err) {
            console.log('sxzxDB连接成功')
        } else {
            console.log('sxzxDB 连接失败。错误信息如下：')
            console.dir(err)
        }
    });
    await sxzxDB.model('rules', ruleSchema)
    await sxzxDB.model('tasks', taskSchema)
    await sxzxDB.model('remotetasks', taskSchema)

    run();
}

async function getOplogs(startTime,endTime) {
    let filter = {
        $and: [
            {
                $or: [
                    { ns: { $regex: 'sxzx' } },
                    { ns: { $regex: 'SearchSystem' } }
                ]
            },
            {
                op: { $in: ['i', 'u', 'd'] }
            },
            {
                wall: { $gte: startTime , $lt: endTime }
            }
        ]
    }
    let logs = await localDB.model('oplog.rs').find(filter, { wall: 1, ns: 1, op: 1, o: 1, o2: 1 })
    logs.sort((a, b) => { return b.wall - a.wall });
    return logs
}

async function run() {  
    //获取时间戳
    let oplogEndTime = await redisClients[5].get('oplogEndTime');
    let startTime = new Date().getTime()-1000*60*60*24;
    // console.log(oplogEndTime);
    if (oplogEndTime != null) {
        startTime = new Date(oplogEndTime).getTime();
    }
    let endTime = new Date().getTime();
    if (startTime < endTime) {
        let ids = [];
        //解析oplog
        let logs = await getOplogs(startTime, endTime);
        for (i = 0; i < logs.length; i++){
            if (logs[i].op == 'd' || logs[i].op == 'i') {
                ids.push(logs[i].o._id.toString())
            }
            else if (logs[i].op == 'u') {
                ids.push(logs[i].o2._id.toString())
            }
        }
        //查询DbCacheMap
        caches = await getDbCacheMap(ids);
        promiseList = [];
        //删除缓存
        for (let i = 0; i < caches.length; i++) {
            promiseList.push(deleteCacheFromRedis(caches[i].cache_id, caches[i].cache_key));
        };
        await Promise.all(promiseList);
        promiseList = [];
        //删除映射
        for (let i = 0; i < ids.length; i++) {
            promiseList.push(deleteDbCache(5,ids[i]));
        };
        await Promise.all(promiseList);
        //延迟双删
        setTimeout(async () => {
            for (let i = 0; i < caches.length; i++) {
                deleteCacheFromRedis(caches[i].cache_id, caches[i].cache_key);
            };
        }, 2000);

        //更新时间戳
        if (logs.length > 0) {
            t = new Date(logs[0].wall).toISOString();
            await redisClients[5].set('oplogEndTime', t);
            redisClients[5].expire('oplogEndTime', 60 * 60 * 24 * 7);
        }
    }
    setTimeout(run, schedule);//100ms后重新执行
}

async function getDbCacheMap(ids) {
    const promiseList = [];
    for (let i = 0; i < ids.length; i++) {
        promiseList.push(redisClients[5].lRange(ids[i],0,-1));
    }
    lists = await Promise.all(promiseList);
    let caches = [];
    for (i = 0; i < lists.length; i++){
        for (j = 0; j < lists[i].length; j++){
            caches.push(JSON.parse(lists[i][j]));
        }
    }
    return caches;
}

async function deleteDbCache(cache_id,cache_key) {
    await redisClients[cache_id].del(cache_key, (err) => {
        if (err) {
            console.log("删除redis:", cache_key, "失败,err:", err);
            deleteDbCache(cache_id, cache_key);
        }
    });
}

async function deleteCacheFromRedis(cache_id,cache_key) {
    await deleteDbCache(cache_id, cache_key);
    console.log("delete cache:",cache_key)
}

async function attachDbCache({
    db_id = null,
    cache_key = null,
    concern_col = null,
    cache_id = null,
}) {
    //绑定缓存
    let str = JSON.stringify({ cache_key: cache_key, concern_col: concern_col, cache_id: cache_id });
    redisClients[5].rPush(db_id, str);  
}

init();

//传入key和value，使用Redis保存
// 命名规则：查询的要素+"_"+查询的要素的id
/**
 * 
 * @param {String} key redis的键
 * @param {String} value redis的值
 * @param {String} db_id mongodb数据编号
 * @param {number} cache_id redis数据库编号
 */
async function setRedis({
    key, value = null, db_id = '1', cache_id = 0
}){
    // let str = JSON.stringify({ key: key, value: value, db_id: db_id, cache_id: cache_id });
    // 保存到Redis
    await redisClients[cache_id].set(key, value, (err) => {if (err) console.log(err)});
    //console.log('@@@@')
    //设置过期时间
    expiration = 60*60*24
    await redisClients[cache_id].expire(key, expiration);
    // 绑定缓存
    await attachDbCache({ db_id, cache_key: key, concern_col: 'cache' , cache_id});
}

// setRedis({
//     key:'3456',
//     value:'3333',
//     db_id : '1',
// })

// 查询Redis
async function getRedis({key, cache_id = 0}){
    let value = null; 
    try {
         value = redisClients[cache_id].get(key);   // 没有值返回null
    } catch (error) {
        return null;
    }
    
    return value;
}

module.exports = {
    init,
    getRedisCli,
    getlocalDB,
    getSxzxDB,
    attachDbCache,
    setRedis,
    getRedis
}