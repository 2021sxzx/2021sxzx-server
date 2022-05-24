#!/bin/bash
source /etc/profile
OUT_DIR=/www/backup/mongodb_bak/mongodb_bak_now #临时备份目录
TAR_DIR=/www/backup/mongodb_bak/mongodb_bak_list #备份存放路径
DATE=$(date "+%Y_%m_%d_%H_%M_%S") #获取当前系统时间
DB_USER=root2
DB_PASS=Hgc16711
MONGODUMP_PATH=/usr/bin/mongodump   #制定mongodump命令运行绝对路径
MONGO_DATABASE="sxzx"  #备份的数据库名称



DAYS=14          #删除14天前的备份
TAR_BAK="mongodb_bak_$DATE.tar.gz"   #最终保存的数据库备份文件
cd $OUT_DIR
rm -rf $OUT_DIR/*
mkdir -p $OUT_DIR/$DATE

$MONGODUMP_PATH -h 8.134.73.52:27017 -u $DB_USER -p $DB_PASS -d $MONGO_DATABASE -o $OUT_DIR/$DATE  #备份数据库

tar -zcvPf $TAR_DIR/$TAR_BAK $OUT_DIR/$DATE  #压缩为.tar.gz格式


find $TAR_DIR/ -mtime +$DAYS -delete  #删除14天前的备份文件

#echo $TAR_BAK

exit

