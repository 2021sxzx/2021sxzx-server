const createError = require('http-errors')
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const jwt = require('jsonwebtoken')
const unitRouter = require('./routes/unit')
const commentRouter = require('./routes/comment')
const systemLogRouter = require('./routes/systemLog')
const taskRouter = require('./routes/taskRoutes')
const itemRouter = require('./routes/item')
const systemResourceRouter = require('./routes/systemResource')
const loginRouter = require('./routes/login')
const userManagementRouter = require('./routes/userManagement')
const roleRouter = require('./routes/role')
const sideBarRouter = require('./routes/sideBar')
const permissionRouter = require('./routes/permission')
const systemFailureRouter = require('./routes/systemFailure')
const systemMetaDataRouter = require('./routes/systemMetaData.js')
const systemBasicRouter = require('./routes/systemBasic.js')
const systemBackupRouter = require('./routes/systemBackup')
const userDepartmentRouter = require('./routes/userDepartment')
const imageRouter = require('./routes/image')
const personalRouter = require('./routes/personal')
const systemMetaAboutUserRouter = require('./routes/systemMetaDataAboutUser')
const verify = require('./routes/verify')
const {statusset} = require('./utils/statusmsg')
const {jwt_secret} = require('./utils/validateJwt')
const {MONGO_CONFIG} = require('./config/config') //数据库的配置信息
const mongoose = require('mongoose')
const redisClient = require('./config/redis')
const Statusset = new Set()

// 异步连接 Redis
redisClient.connect().then(() => {
  console.log('Redis 连接成功')
}).catch((err) => {
  console.log('Redis 连接失败。错误信息如下：')
  console.dir(err)
})

// 异步连接 MongoDB
mongoose.connect(MONGO_CONFIG.url).then(() => {
  console.log('MongoDB 连接成功')
}).catch((err) => {
  console.log('MongoDB 连接失败。错误信息如下：')
  console.dir(err)
})

// 创建 express 对象
const app = express()

// 动态网页的模板设置
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// 使用cookieParser将cookie转换成为对象，以便更好的使用.
// cookieParser 函数内部自带 next()，直接传入即可，不需要手动调用 next()
app.use(cookieParser())

//json 和 urlencoded 的大小限制
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}))

// post请求的参数的获取, express会将解析之后, 转换成对象的post请求参数放到请求对象的body属性中
app.use(express.json())// 告诉express能够解析 application/json类型的请求参数
app.use(express.urlencoded({extended: false}))// 告诉express能够解析 表单类型的请求参数 application/x-www-form-urlencoded

// 处理静态资源
app.use(express.static(path.join(__dirname, 'public')))

// 为所有响应添加跨域设置
app.use('*', function (req, res, next) {
  // TODO（钟卓江）: 我认为为了安全性考虑应该限制允许跨域的来源
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'POST,GET,TRACE,OPTIONS')
  res.header('X-Powered-By', '3.2.1')
  next()
})

// 前端的预检请求（preflight request），为了获知服务端是否允许该请求
app.options('*', (req, res) => {
  res.sendStatus(200)
})

// 检查用户的 token 是否合法
app.use('*', (req, res, next) => {
  // 用户状态被切换成未激活，则或将 account 放进 statusset 中
  // 获取 token
  const token = req.cookies['auth-token']
  // 如果没有 token ，说明后台用户未登录或者是前台的请求，next()
  if (token === undefined) {
    // TODO
    // console.log('I\'m in token undefined')
  } else {
    // 解析用户账号信息
    const account = jwt.verify(token, jwt_secret, null, null).account
    // 如果这个账号在 statusset 中出现了，说明这个账号被切换成了未激活状态
    if (statusset.has(account)) {
      //设置个定时器可以保证多个请求同时进来时都不响应
      // TODO(钟卓江)：设置定时器延迟 500ms 再删除其中的 account 这里有风险，万一对方网络延迟大于 500ms 就失效。
      setTimeout(() => statusset.delete(account), 500)
      // 设置响应码 401 并发送 JSON 对象
      res.status(401).json({loginstate: 'loginout'})
    }
  }
  next()
})

// //验证是否有登录权限
// async function verifyStatus(token){
//     if(token==undefined)
//         return
//     const account = await jwt.verify(token, jwt_secret, null, null).account
//     console.log(account)
//     let ans = await getActivation(account)
//     if(ans==0)
// }

// 配置日志的本地文件路径
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log/access.log'), {flags: 'a'})
// 往日志添加用户信息
logger.token('id', function getId(req) {
  return req.headers.userid
})
// 往日志添加时间
logger.token('localDate', function getDate() {
  const date = new Date(new Date().getTime() + 8 * 3600 * 1000)
  return date.toISOString()
})
// 日志中间件的设置使用
app.use(logger(':id :remote-addr - :remote-user [:localDate] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
  skip: function (req) {
    return req.headers.userid === undefined
  },
  stream: accessLogStream,
}))

// 处理路由
app.use('/api', verify)
app.use('/api', unitRouter)
app.use('/api', commentRouter)
app.use('/api', taskRouter)
app.use('/api', systemLogRouter)
app.use('/api', itemRouter)
app.use('/api', systemResourceRouter)
app.use('/api', loginRouter)
app.use('/api', userManagementRouter)
app.use('/api', sideBarRouter)
app.use('/api', roleRouter)
app.use('/api', permissionRouter)
app.use('/api', systemFailureRouter)
app.use('/api', systemBasicRouter)
app.use('/api', systemMetaDataRouter)
app.use('/api', systemBackupRouter)
app.use('/api', imageRouter)
app.use('/api', userDepartmentRouter)
app.use('/api', personalRouter)
app.use('/api', systemMetaAboutUserRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
// WARNING by lhy - error handler 必须提供 4 参数方法版本，否则传递的参数为 (req, res, next) 会发生错误
app.use((err, req, res, next) => {
  console.error(`Error handler in app.js caught error:`)
  console.error(err)
  res.sendStatus(err.status || 500)
})

module.exports = app
module.exports.Statusset = Statusset
