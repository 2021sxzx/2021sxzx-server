const redisClient = require('../config/redis')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const systemMeta = require('../model/systemMeta')
const chartData = require('../model/chartData')
const item = require('../model/item')
const users = require('../model/users')
const {SuccessModel, ErrorModel} = require('../utils/resultModel')
const schedule = require('node-schedule')

class systemMetaService {
    constructor() {
        this.thisTime = new Date().getDay()
        this.userNumber = []

        this.api = {
            SHBAPP: null,
            GZSRSJGW: null,
            ZNFWJQRYPT: null,
            GDZWFWPT: null,
            BDDT: null,
        }

        this.interfaceData = {
            SHBAPP: null,
            GZSRSJGW: null,
            ZNFWJQRYPT: null,
            GDZWFWPT: null,
            BDDT: null,
        }
    }

    async setApiData(api) {
        try {
            // CentOS的CMD指令集，和window的指令是不兼容的，如果需要在window跑起该代码，需要改为：ping ${this.api.xxx}
            // 思路：获取从cmd的文本，然后切割出数据，最后判断接口网络状态好坏
            // 获取文本数据
            // const SHBAPP_DATA = await exec(`ping -c 4 -n ${api.SHBAPP}`);
            // const GZSRSJGW_DATA = await exec(`ping -c 4 -n ${api.GZSRSJGW}`);
            // const ZNFWJQRYPT_DATA = await exec(`ping -c 4 -n ${api.ZNFWJQRYPT}`);
            // const GDZWFWPT_DATA = await exec(`ping -c 4 -n ${api.GDZWFWPT}`);
            // const BDDT_DATA = await exec(`ping -c 4 -n ${api.BDDT}`);

            // // 提取文本或者错误回调
            // const SHBAPP = SHBAPP_DATA.stderr ? SHBAPP_DATA.stderr : SHBAPP_DATA.stdout;
            // const GZSRSJGW = GZSRSJGW_DATA.stderr ? GZSRSJGW_DATA.stderr : GZSRSJGW_DATA.stdout;
            // const ZNFWJQRYPT = ZNFWJQRYPT_DATA.stderr ? ZNFWJQRYPT_DATA.stderr : ZNFWJQRYPT_DATA.stdout;
            // const GDZWFWPT = GDZWFWPT_DATA.stderr ? GDZWFWPT_DATA.stderr : GDZWFWPT_DATA.stdout;
            // const BDDT = BDDT_DATA.stderr ? BDDT_DATA.stderr : BDDT_DATA.stdout;

            // // 处理文本数据
            // const SHBAPP_ARRAY = SHBAPP.split('\n').filter(item => item != '');
            // const GZSRSJGW_ARRAY = GZSRSJGW.split('\n').filter(item => item != '');
            // const ZNFWJQRYPT_ARRAY = ZNFWJQRYPT.split('\n').filter(item => item != '');
            // const GDZWFWPT_ARRAY = GDZWFWPT.split('\n').filter(item => item != '');
            // const BDDT_ARRAY = BDDT.split('\n').filter(item => item != '');

            // // 大致信息
            // const APPROXIMATE_SHBAPP = SHBAPP_ARRAY[SHBAPP_ARRAY.length - 1].split('=')[1].split(' ')[0].split('/');
            // const APPROXIMATE_GZSRSJGW = GZSRSJGW_ARRAY[GZSRSJGW_ARRAY.length - 1].split('=')[1].split(' ')[0].split('/');
            // const APPROXIMATE_ZNFWJQRYPT = ZNFWJQRYPT_ARRAY[ZNFWJQRYPT_ARRAY.length - 1].split('=')[1].split(' ')[0].split('/');
            // const APPROXIMATE_GDZWFWPT = GDZWFWPT_ARRAY[GDZWFWPT_ARRAY.length - 1].split('=')[1].split(' ')[0].split('/');
            // const APPROXIMATE_BDDT = BDDT_ARRAY[BDDT_ARRAY.length - 1].split('=')[1].split(' ')[0].split('/');

            // // 详细信息
            // const DETAILED_SHBAPP = SHBAPP_ARRAY[SHBAPP_ARRAY.length - 2].split(' ').filter(item => { return !Number.isNaN(Number(item)) }).map(item => Number(item));
            // const DETAILED_GZSRSJGW = GZSRSJGW_ARRAY[GZSRSJGW_ARRAY.length - 2].split(' ').filter(item => { return !Number.isNaN(Number(item)) }).map(item => Number(item));
            // const DETAILED_ZNFWJQRYPT = ZNFWJQRYPT_ARRAY[ZNFWJQRYPT_ARRAY.length - 2].split(' ').filter(item => { return !Number.isNaN(Number(item)) }).map(item => Number(item));
            // const DETAILED_GDZWFWPT = GDZWFWPT_ARRAY[GDZWFWPT_ARRAY.length - 2].split(' ').filter(item => { return !Number.isNaN(Number(item)) }).map(item => Number(item));
            // const DETAILED_BDDT = BDDT_ARRAY[SHBAPP_ARRAY.length - 2].split(' ').filter(item => { return !Number.isNaN(Number(item)) }).map(item => Number(item));

            // async function judgeConnectingIsSuccessful (APPROXIMATE, DETAILED) {
            //   if (DETAILED[0] > DETAILED[1]) {
            //     return "差"
            //   } else {
            //     if (APPROXIMATE[2] - APPROXIMATE[0] < 200 && APPROXIMATE[1] < 150) {
            //       return "优"
            //     } else {
            //       return "良"
            //     }
            //   }
            // }

            // const SHBAPP_INTERFACE_STATUS = await judgeConnectingIsSuccessful(APPROXIMATE_SHBAPP, DETAILED_SHBAPP);
            // const GZSRSJGW_INTERFACE_STATUS = await judgeConnectingIsSuccessful(APPROXIMATE_GZSRSJGW, DETAILED_GZSRSJGW);
            // const ZNFWJQRYPT_INTERFACE_STATUS = await judgeConnectingIsSuccessful(APPROXIMATE_ZNFWJQRYPT, DETAILED_ZNFWJQRYPT);
            // const GDZWFWPT_INTERFACE_STATUS = await judgeConnectingIsSuccessful(APPROXIMATE_GDZWFWPT, DETAILED_GDZWFWPT);
            // const BDDT_INTERFACE_STATUS = await judgeConnectingIsSuccessful(APPROXIMATE_BDDT, DETAILED_BDDT);

            // 在window使用的测试数据
            const SHBAPP_INTERFACE_STATUS = '优'
            const GZSRSJGW_INTERFACE_STATUS = '优'
            const GZSRSJWX_INTERFACE_STATUS = '优'
            const ZNFWJQRYPT_INTERFACE_STATUS = '优'
            const GDZWFWPT_INTERFACE_STATUS = '优'
            const BDDT_INTERFACE_STATUS = '优'

            this.interfaceData = {
                SHBAPP: SHBAPP_INTERFACE_STATUS,
                GZSRSJGW: GZSRSJGW_INTERFACE_STATUS,
                GZSRSJWX: GZSRSJWX_INTERFACE_STATUS,
                ZNFWJQRYPT: ZNFWJQRYPT_INTERFACE_STATUS,
                GDZWFWPT: GDZWFWPT_INTERFACE_STATUS,
                BDDT: BDDT_INTERFACE_STATUS,
                // SHBAPP, GZSRSJGW, GZSRSJWX, ZNFWJQRYPT, GDZWFWPT, BDDT
            }
            return this.interfaceData
        } catch (error) {
            return new ErrorModel({
                msg: error,
            })
        }
    }

    getDailyItemNum = async () => {
        // 本地无法访问日志，随便返回一个数字，供本地测试用
        // return 100
        const readline = require('readline')
        const fs = require('fs')
        const rl = readline.createInterface({
            input: fs.createReadStream('/www/wwwlogs/access.log'),
        })

        let daily_item_num = 0 // PV初始化为0
        let today = new Date().setHours(0,0,0,0); // 获取今天的日期，注意格式要与日志文件对应

        // readline是异步操作，使用for await执行
        // PV 增加的逻辑是日志中访问了 getItems 接口，并且日期是今天。注意 includes 方法中的匹配字符串，前面增加 /，后面增加空格，保证不受前后缀影响
        // 从日志中分隔日期的代码耦合度较大，无奈，注意当日志格式发生变化时需要做相应更改
        for await (const line of rl) {
            let now = new Date(line.split("[")[1].split(" ")[0].split(":")[0]).setHours(0,0,0,0)
            daily_item_num += line.includes("/getItems ") && now === today;
        }
        return daily_item_num
    }

    getTotalItemNum = async () => {
        // 本地无法访问日志，随便返回一个数字，供本地测试用
        // return 100
        const readline = require('readline')
        const fs = require('fs')
        const rl = readline.createInterface({
            input: fs.createReadStream('/www/wwwlogs/access.log'),
        })

        let total_item_num = 0 // PV初始化为0

        // readline是异步操作，使用for await执行
        for await (const line of rl) {
            total_item_num += line.includes("/getItems ")
        }
        return total_item_num
    }

    // 删除用户访问量
    // calculateUV = () => {
    //     // 本地访问不到服务器的nginx日志, 返回一个随机数据[100,200]
    //     return Math.floor(Math.random() * 101) + 100

    //     const shell = require('shelljs')

    //     const file_path = '/www/wwwlogs' // 前台nginx日志所在目录
    //     const file_name = "/www/wwwlogs/sxzx_qt_access.log";  //前台nginx日志文件名

    //     // shell.cd(file_path) //切换到前台nginx日志所在目录
    //     const time = shell.exec('date "+%d/%b/%Y"').stdout //获取当前系统时间
    //     const uv = shell
    //         .exec(
    //             'grep' +
    //             ' "' +
    //             time +
    //             '" ' +
    //             file_name +
    //             ' | awk \'{print $1}\' | sort | uniq -c| sort -nr | wc -l'
    //         )
    //         .stdout.trim() //获取当日uv
    //     return parseInt(uv) //转换成数字
    // }

    async init() {
        const metas = (
            await systemMeta.findOne({name: 'interface-setting'}, 'data')
        ).data
        this.api = {
            SHBAPP: metas.api_SHBAPP,
            GZSRSJGW: metas.api_GZSRSJGW,
            GZSRSJWX: metas.api_GZSRSJWX,
            ZNFWJQRYPT: metas.api_ZNFWJQRPT,
            GDZWFWPT: metas.api_GDZWFWPT,
            BDDT: metas.api_BDDT,
        }

        // 第一次的触发执行
        await this.setApiData(this.api)
        let that = this

        // 网络接口问题：每隔12个小时来ping一下
        setInterval(async () => {
            // 注意this的换绑问题，箭头函数本身是没有this的
            await that.setApiData(this.api)
        }, 3600)

        // 设置定时规则
        let rule = new schedule.RecurrenceRule()
        // 每天23点55分执行
        rule.hour = 23
        rule.minute = 55
        rule.second = 0

        // 设置存储时长为6天
        let storageDays = 6

        // 启动定时任务存储图表数据
        schedule.scheduleJob(rule, async () => {
            if (
                !!(await chartData.findOne({date: new Date().setHours(0, 0, 0, 0)}))
            ) {
                // 当天数据已存在时不重复存储
                console.log('当天数据已存在')
                return
            }
            // 删除存储时长前的全部数据
            let oldday = new Date()
            oldday.setHours(0, 0, 0, 0)
            oldday.setDate(oldday.getDate() - storageDays)
            chartData.deleteMany({date: {$lte: oldday}}, (err, rawResponse) => {
                if (err) {
                    console.log(err)
                }
                console.log('删除成功', rawResponse)
            })
            // 存入当天数据
            chartData.create(
                {
                    date: new Date().setHours(0, 0, 0, 0), //设置为0:0:0:0使echarts的x轴对齐
                    daily_item_num: await this.getDailyItemNum(), // 每日事项浏览量
                    total_item_num: await this.getDailyItemNum(), // 累计事项浏览量
                    user_num: await users.count({}), // 已经注册用户数量
                    item_num: await item.count({}), // 当前事项数量
                },
                function (err, docs) {
                    if (err) console.log(err)
                    console.log('保存成功：' + docs)
                }
            )
        })
    }

    // 修改接口并重新ping
    async patchInterface(api) {
        try {
            await systemMeta.updateOne(
                {name: 'interface-setting'},
                {$set: {data: api}}
            )
            this.api = api
            await this.setApiData(this.api)
            return new SuccessModel({
                msg: '修改接口成功',
                data: this.interfaceData,
            })
        } catch (error) {
            return new ErrorModel({
                msg: '修改接口失败',
            })
        }
    }

    async getInterfaceMessage() {
        try {
            await this.setApiData(this.api)
            return new SuccessModel({
                msg: '获取接口状态成功',
                data: this.interfaceData,
            })
        } catch (error) {
            return new ErrorModel({
                msg: '获取接口状态失败',
            })
        }
    }

    async getInterfaceUrl() {
        try {
            let InterfaceUrl = await systemMeta.findOne(
                {name: 'interface-setting'},
                'data'
            )
            return new SuccessModel({
                msg: '获取接口URL成功',
                data: InterfaceUrl.data,
            })
        } catch (error) {
            return new ErrorModel({
                msg: '获取接口URL失败',
            })
        }
    }

    // 获取核心设置
    async getCoreSetting() {
        try {
            let CoreSetting = await systemMeta.findOne(
                {name: 'core-setting'},
                'data'
            )
            return new SuccessModel({
                msg: '获取核心设置成功',
                data: CoreSetting.data,
            })
        } catch (error) {
            return new ErrorModel({
                msg: '获取核心设置失败',
            })
        }
    }

    // 修改核心设置
    async patchCoreSetting(CoreSetting) {
        try {
            await systemMeta.updateOne(
                {name: 'core-setting'},
                {$set: {data: CoreSetting}}
            )
            return new SuccessModel({
                msg: '修改核心设置成功',
            })
        } catch (error) {
            return new ErrorModel({
                msg: '修改核心设置失败',
            })
        }
    }

    // 根据type获取图表数据
    async getChartData(type) {
        try {
            // 获取数据库存储的数据
            let ChartData = await chartData.find(
                {},
                {date: 1, [type]: 1, _id: 0},
                {
                    sort: {date: 1}, // 以防万一还是排下序
                }
            )
            let data
            switch (type) {
                case 'daily_item_read':
                    data = await this.getDailyItemNum()
                    break
                case 'total_item_read':
                    data = await this.getTotalItemNum()
                    break
                case 'user_num':
                    data = await users.count({})
                    break
                case 'item_num':
                    data = await item.count({})
                    break
                default:
                    return new ErrorModel({
                        msg: "type错误，获取图表数据失败",
                    });
            }
            // 将当天最新的数据插入结果
            ChartData.push({
                date: new Date().setHours(0, 0, 0, 1),
                [type]: data,
            })
            console.log(ChartData)
            return new SuccessModel({
                msg: '获取图表数据成功',
                data: ChartData,
            })
        } catch (error) {
            console.log(error)
            return new ErrorModel({
                msg: '获取图表数据失败',
            })
        }
    }
}

const _systemMetaService = new systemMetaService();

// IIFE，让初始化能够提前执行
(async () => {
    await _systemMetaService.init()
})()

module.exports = _systemMetaService
