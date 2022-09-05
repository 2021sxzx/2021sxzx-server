#!/bin/bash
# 只能用在第一行的 shebang（#!/bin/bash），指示操作系统使用 bash 作为默认 shell 来运行脚本

# 调用本脚本的命令应为：
# sh FILE_PATH ROOT_USER ROOT_PASSWORD DB_IP DB_PORT DB_USER DB_PASS MONGO_DATABASE EXPIRES
# sh ./MongoDBBak.sh root 123456 8.134.73.52 27017 root2 Hgc16711 sxzx 14

# 获取输入的参数
# $0 是 FILE_PATH
#readonly ROOT_USER=$1# 切换为 root 角色
#readonly ROOT_PASSWORD=$2# root 角色的密码
# 数据库的 ip
readonly DB_IP=$3
# 数据库的端口
readonly DB_PORT=$4
# 数据库的用户名
readonly DB_USER=$5
# 数据库密码
readonly DB_PASS=$6
# 数据库名称
readonly MONGO_DATABASE=$7
# 备份的过期时间，用于删除过期的备份，单位 days
readonly EXPIRES=$8

# 常量参数
# 临时备份目录，绝对路径
readonly OUT_DIR=/mongodb_bak/mongodb_bak_now
# 备份存放路径，绝对路径
readonly TAR_DIR=/mongodb_bak/mongodb_bak_list

# 获取 root 权限，send 后输入密码，\r 不能少
#spawn su $ROOT_USER
#send $ROOT_PASSWORD

# 获取当前系统时间
readonly DATE=$(date "+%Y_%m_%d_%H_%M_%S")
# 根据 DATE 设置最终保存的数据库备份文件名称
readonly TAR_BAK="mongodb_bak_$DATE.tar.gz"

# TODO: 为什么要 cd 过去？
# 跳转到 OUT_DIR 目录，:? 用于判断变量是否存在，|| 后面那段用于判断目录路径是否存在，不存在就创建一个。
#cd ${OUT_DIR:?} || mkdir -p - v${OUT_DIR:?}
#cd ${OUT_DIR:?} || echo "OUT_DIR not exist, OUT_DIR = $OUT_DIR" && exit 1

# 创建临时缓存目录，取名叫 $DATE。-p：如果目录不存在就自动创建对应目录。一次可以创建多个目录。-v 如果创建了新目录就显示信息。
# 双引号以防止通配符和分词，see: https://github.com/koalaman/shellcheck/wiki/SC2086
mkdir -p -v "${OUT_DIR:?}"/"${DATE:?}"
mkdir -p "${TAR_DIR:?}"

# 备份数据库到 $DATE 目录
mongodump -h "${DB_IP:?}":"${DB_PORT:?}" -u "${DB_USER:?}" -p "${DB_PASS:?}" -d "${MONGO_DATABASE:?}" -o "${OUT_DIR:?}"/"${DATE:?}"
# 压缩为.tar.gz格式，保存到 $TAR_DIR 目录下
tar -zcPf "${TAR_DIR:?}"/"${TAR_BAK:?}" "${OUT_DIR:?}"/"${DATE:?}"

# 删除 OUT_DIR 中的缓存文件
# 关于删除文件为什么要加上 :? 来检查变量 => https://github.com/koalaman/shellcheck/wiki/SC2115
rm -rf "${OUT_DIR:?}"/*

# 删除过期的备份文件
find "${TAR_DIR:?}"/ -mtime +"${EXPIRES:?}" -delete

# 展示所有备份的文件
echo "${TAR_DIR:?}"/"${TAR_BAK:?}"

exit
##==================我是分割线===========================#
##据说能够正常使用的原始文件，不需要外部传参，固定连接阿里云
## 获取 root 权限，send 后输入密码，\r 不能少
#spawn su root
#send '123456\r'
#
#OUT_DIR=/mongodb_bak/mongodb_bak_now  #临时备份目录
#TAR_DIR=/mongodb_bak/mongodb_bak_list #备份存放路径
#DATE=$(date "+%Y_%m_%d_%H_%M_%S")                     #获取当前系统时间
#DB_USER=root2
#DB_PASS=Hgc16711
#MONGO_DATABASE="sxzx"             #备份的数据库名称
#
#DAYS=14                            #删除14天前的备份
#TAR_BAK="mongodb_bak_$DATE.tar.gz" #最终保存的数据库备份文件
#cd $OUT_DIR
#rm -rf $OUT_DIR/*
#mkdir -p $OUT_DIR/$DATE
#
#mongodump -h 8.134.73.52:27017 -u $DB_USER -p $DB_PASS -d $MONGO_DATABASE -o $OUT_DIR/$DATE #备份数据库
#
#tar -zcPf $TAR_DIR/$TAR_BAK $OUT_DIR/$DATE #压缩为.tar.gz格式
#
#find $TAR_DIR/ -mtime +$DAYS -delete #删除14天前的备份文件
#
#echo $TAR_DIR/$TAR_BAK
#
#exit
