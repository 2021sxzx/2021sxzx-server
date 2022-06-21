#!/bin/bash
source /etc/profile
OUT_DIR=/bigdisk/sxzx_dbb/mongodb_bak/mongodb_bak_now #临时备份目录
TAR_DIR=/bigdisk/sxzx_dbb/mongodb_bak/mongodb_bak_list #备份存放路径
DATE=$(date "+%Y_%m_%d") #获取当前系统时间 1.记录备份时间 2.做备份文件名
# 只能跑linux
# 把数据库数据备份本地
DB_USER=root2 #连接数据库的账号
DB_PASS=Hgc16711 #连接数据库的密码
MONGODUMP_PATH=/usr/bin/mongodump   #制定mongodump命令运行绝对路径
MONGO_DATABASE="sxzx"  #备份的数据库名称

# 本地数据存进数据库
DB_USERR=admin
DB_PASSR=IHCI123..
MONGORESTORE_PATH=/usr/bin/mongorestore #数据库恢复
MONGO_DATABASER="sxzx"

DAYS=14          #删除14天前的备份
TAR_BAK="mongodb_bak_$DATE.tar.gz"   #最终保存的数据库备份文件
cd $OUT_DIR
rm -rf $OUT_DIR/*
mkdir -p $OUT_DIR/$DATE

$MONGODUMP_PATH -h 8.134.73.52:27017 -u $DB_USER -p $DB_PASS -d $MONGO_DATABASE -o $OUT_DIR/$DATE  #备份数据库

tar -zcvPf $TAR_DIR/$TAR_BAK $OUT_DIR/$DATE  #压缩为.tar.gz格式

$MONGORESTORE_PATH -h 127.0.0.1:27017 -d $MONGO_DATABASER $OUT_DIR/$DATE -u $DB_USERR -p $DB_PASSR --authenticationDatabase "admin"  #存储数据

find $TAR_DIR/ -mtime +$DAYS -delete  #删除14天前的备份文件

exit

