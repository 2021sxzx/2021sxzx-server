const unitRouter = require('./unit')
const commentRouter = require('./comment')
const systemLogRouter = require('./systemLog')
const taskRouter = require('./taskRoutes')
const itemRouter = require('./item')
const systemResourceRouter = require('./systemResource')
const loginRouter = require('./login')
const userManagementRouter = require('./userManagement')
const roleRouter = require('./role')
const sideBarRouter = require('./sideBar')
const permissionRouter = require('./permission')
const systemFailureRouter = require('./systemFailure')
const systemMetaDataRouter = require('./systemMetaData.js')
const systemBasicRouter = require('./systemBasic.js')
const systemBackupRouter = require('./systemBackup')
const userDepartmentRouter = require('./userDepartment')
const imageRouter = require('./image')
const personalRouter = require('./personal')
const systemMetaAboutUserRouter = require('./systemMetaDataAboutUser')
const verify = require('./verify')
const tyrzRouter = require('./tyrz')

const routesStore = [
    unitRouter,
    commentRouter,
    systemLogRouter,
    taskRouter,
    itemRouter,
    systemResourceRouter,
    loginRouter,
    userManagementRouter,
    roleRouter,
    sideBarRouter,
    permissionRouter,
    systemFailureRouter,
    systemMetaDataRouter,
    systemBasicRouter,
    systemBackupRouter,
    userDepartmentRouter,
    imageRouter,
    personalRouter,
    systemMetaAboutUserRouter,
    verify,
    tyrzRouter,
]

const loadRoutes = (routesStore, path = '/api', expressInstance) => {
    routesStore.forEach(route => {
        expressInstance?.use(path, route)
    })
}

module.exports = {
    routesStore,
    loadRoutes
}