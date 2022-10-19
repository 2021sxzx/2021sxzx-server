const systemConfiguration = require("../model/systemConfiguration");
const systemBackup = require("../model/systemBackup");
const user = require("../model/users");
const fs = require("fs");
const path = require("path");
const child = require("child_process");
const { MONGO_CONFIG } = require("../config/config");

const filePath = path.join(__dirname, "./MongoDBBak.sh");
const logPath = path.join(__dirname, "../log/access.log");

let isBackingUp = false;

function getDate() {
    return new Date(new Date().getTime() + 8 * 3600 * 1000).toISOString();
}

/**
 * 手动/自动备份公共方法
 * @param {String} mode - 指示手动还是自动备份，手动为 'manual'，自动为 'auto'
 * @param user_id - 手动备份时使用，指示用户 id
 */
function backup(mode, user_id = null) {
  try {
    console.log(mode, "backup");
    command = `sh ${filePath} root 123456 ${MONGO_CONFIG.ip} ${MONGO_CONFIG.port} ${MONGO_CONFIG.user} ${MONGO_CONFIG.password} ${MONGO_CONFIG.dbName} 365`;
    // console.log(command);
    
    
            
          

    fs.access("../mongodb_bak/mongodb_bak_now", fs.constants.F_OK, (err) => {
        if(err) {
          fs.mkdir("../mongodb_bak/mongodb_bak_now", 0777, function(err) {
              if(!err) {
                console.log("创建目录成功");
              } else{
                console.log(err);
              }
            })
        }
      });

    fs.access("../mongodb_bak/mongodb_bak_list", fs.constants.F_OK, (err) => {
        if(err) {
          fs.mkdir("../mongodb_bak/mongodb_bak_now", 0777, function(err) {
              if(!err) {
                console.log("创建目录成功");
              } else{
                console.log(err);
              }
            })
        }
      });
  
    child
        .exec(command, async function (err, stdout, stderr) {
            // 计算备份名
            let backup_name = stdout.toString().split("\n");
            backup_name = backup_name[backup_name.length - 2];
            // 计算用户名
            const { user_name } =
                mode === "manual"
                    ? await user.findOne({ _id: user_id })
                    : "系统";
            // 公共方法执行信息
            const info = {
                auto: {
                    errorStr: "定时",
                    successStr: `系统 ::[${getDate()}] "系统自动备份"\n`,
                },
                manual: {
                    errorStr: "手动",
                    successStr: `${backup_name}|||${user_name} ::[${getDate()}] "手动系统备份完成"\n`,
                },
            }[mode];
            const writeStream = fs.createWriteStream(logPath, { flags: "a" });

            // 注意，shell脚本中的mongodump命令会向stderr写入内容，【即使备份没有错误】，因此这里不再使用stderr来判断是否出错
            if (err) {
                await createSystemBackup("", user_name, "failed");
                writeStream.write(
                    `${info.errorStr}备份故障[${getDate()}] err = ${err}。\n`
                );
            } else {
                await createSystemBackup(backup_name, user_name);
                writeStream.write(info.successStr);
            }
            writeStream.end();
            isBackingUp = false;

            // console.log('stderr',stderr)
        })
        // console.log("Hello World")
    } catch(err) {
      console.log(err)
    }
}

// 启动定时器执行自动备份
let backupCycle;

function cycle(res) {
    backupCycle = setInterval(() => {
        if (!isBackingUp) backup("auto");
    }, res * 86400000);
}

getMongoBackupCycle().then(cycle);

/**
 * 返回系统备份周期
 * @returns {Promise<*|*>}
 */
async function getMongoBackupCycle() {
    /** @property data.configuration */
    try {
        const data = await systemConfiguration.findOne({
            name: "backup_cycle",
        });
        return data.configuration.cycle;
    } catch (e) {
        return e.message;
    }
}

/**
 * 返回系统备份
 * @returns {Promise<*|*>}
 */
async function getSystemBackup() {
    try {
        return JSON.parse(JSON.stringify(await systemBackup.find()));
    } catch (e) {
        return e.message;
    }
}

/**
 * 创建系统备份
 * @returns {Promise<*|*>}
 */
async function createSystemBackup(backup_name, user_name, status = "ok") {
    try {
        return await systemBackup.create({
            backup_name,
            user_name,
            file_size: status === "ok" ? fs.statSync(backup_name).size : null,
            status,
            backup_date: new Date(),
        });
    } catch (e) {
        return e.message;
    }
}

/**
 * 修改系统备份周期
 * @returns {Promise<*|*>}
 */
async function changeBackupCycleService(data) {
    try {
        await systemConfiguration.updateOne(
            { name: "backup_cycle" },
            {
                $set: { configuration: { cycle: data.time } },
            }
        );
        // 修改备份后重置定时器
        clearInterval(backupCycle);
        getMongoBackupCycle().then(cycle);
        await systemConfiguration.findOne({ name: "backup_cycle" });
        return "success";
    } catch (e) {
        return e.message;
    }
}

/**
 * 手动系统备份
 * @param user_id - 用户id
 * @return {Promise<boolean|*>} - 是否备份中
 */
async function handleBackup(user_id) {
    /** @property backup_user.user_name */
    try {
        if (isBackingUp) return true;
        else {
            isBackingUp = true;
            backup("manual", user_id);
            return false;
        }
    } catch (e) {
        return e.message;
    }
}

module.exports = {
    getMongoBackupCycle,
    changeBackupCycleService,
    handleBackup,
    getSystemBackup,
    createSystemBackup,
};
