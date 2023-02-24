shell = require("shelljs")
const time = shell.exec('date "+%d/%b/%Y"').stdout //获取当前系统时间
const uv = shell
    .exec(
        'grep' +
        ' "' +
        time +
        '" ' +
        file_name +
        ' | awk \'{print $1}\' | sort | uniq -c| sort -nr | wc -l'
    )
    .stdout.trim() //获取当日uv

console.log(uv)

